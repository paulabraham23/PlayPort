import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { adminStyles } from '@/components/admin/adminStyles';
import { UnitGamesEditor } from '@/components/admin/UnitGamesEditor';
import { Button } from '@/components/ui/Button';
import { colors, radii, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { adminGetProduct } from '@/lib/adminFirestore';
import { uploadProductImage } from '@/lib/productImages';
import { useAdminStore } from '@/store/adminStore';
import type { Product, ProductHourlyRate, RentalPlan } from '@/types';
import {
  DEFAULT_PLAN_TEMPLATES,
  describeControllerPrice,
  isControllerAddon,
  normalizeProduct,
  priceForAddon,
} from '@/utils/rentalPricing';
import { formatINR } from '@/utils/format';
import type { ProductAddon } from '@/types';

const EMPTY: Product = {
  id: '',
  name: '',
  shortName: '',
  description: '',
  categoryId: 'gaming',
  images: [],
  plans: DEFAULT_PLAN_TEMPLATES.map((t) => ({ ...t, price: 0 })),
  hourly: { enabled: false, firstHourPrice: 0, extraHourPrice: 0, maxHours: 24 },
  addons: [],
  compareAtPrice: undefined,
  rating: 0,
  reviewCount: 0,
  tags: [],
  badge: '',
  etaMinutes: 30,
  availabilityLabel: 'Check availability',
  includes: [],
  requirements: [],
  popular: false,
  featured: false,
};

type IncludeRow = { title: string; detail: string; tag?: string };

function num(t: string): number {
  return Number(t.replace(/[^0-9]/g, '')) || 0;
}

export default function AdminProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const { horizontalPadding } = useResponsive();
  const saveProduct = useAdminStore((s) => s.saveProduct);
  const categories = useAdminStore((s) => s.categories);
  const units = useAdminStore((s) => s.units);
  const hubs = useAdminStore((s) => s.hubs);
  const saveUnit = useAdminStore((s) => s.saveUnit);
  const [unitNumber, setUnitNumber] = useState('001');
  const [form, setForm] = useState<Product>(EMPTY);
  const [plans, setPlans] = useState<RentalPlan[]>(EMPTY.plans);
  const [hourly, setHourly] = useState<ProductHourlyRate>(
    EMPTY.hourly ?? { enabled: false, firstHourPrice: 0, extraHourPrice: 0, maxHours: 24 }
  );
  const [addons, setAddons] = useState<ProductAddon[]>([]);
  const [controllerPerHour, setControllerPerHour] = useState('');
  const [controllerHourCap, setControllerHourCap] = useState('6');
  const [controllerFlat, setControllerFlat] = useState('');
  const [controllerFlatFrom, setControllerFlatFrom] = useState('12');
  const [controllerMax, setControllerMax] = useState('3');
  const [tagsText, setTagsText] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [includes, setIncludes] = useState<IncludeRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) {
      setForm(EMPTY);
      setPlans(EMPTY.plans);
      setHourly(EMPTY.hourly!);
      setAddons([]);
      setControllerPerHour('');
      setControllerHourCap('6');
      setControllerFlat('');
      setControllerFlatFrom('12');
      setControllerMax('3');
      setTagsText('');
      setRequirementsText('');
      setIncludes([]);
      return;
    }
    void (async () => {
      const p = await adminGetProduct(id);
      if (p) {
        const n = normalizeProduct({ ...EMPTY, ...p });
        setForm({ ...EMPTY, ...n, badge: n.badge ?? '', compareAtPrice: n.compareAtPrice });
        setPlans(n.plans.length ? n.plans : EMPTY.plans);
        setHourly(
          n.hourly ?? { enabled: false, firstHourPrice: 0, extraHourPrice: 0, maxHours: 24 }
        );
        const ctrl = (n.addons ?? []).find((a) => isControllerAddon(a));
        setControllerPerHour(ctrl && ctrl.pricing.perHour > 0 ? String(ctrl.pricing.perHour) : '');
        setControllerHourCap(ctrl ? String(ctrl.pricing.perHourMaxPlanHours) : '6');
        setControllerFlat(ctrl && ctrl.pricing.flatPrice > 0 ? String(ctrl.pricing.flatPrice) : '');
        setControllerFlatFrom(ctrl ? String(ctrl.pricing.flatMinPlanHours) : '12');
        setControllerMax(ctrl ? String(ctrl.maxQuantity) : '3');
        setAddons((n.addons ?? []).filter((a) => !isControllerAddon(a)));
        setTagsText((n.tags ?? []).join(', '));
        setRequirementsText((n.requirements ?? []).join('\n'));
        setIncludes((n.includes ?? []).map((i) => ({ ...i })));
      }
    })();
  }, [id, isNew]);

  const setField = <K extends keyof Product>(key: K, value: Product[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onUploadImage = async () => {
    setImageError(null);
    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setImageError('Allow photo access to upload a product image.');
        return;
      }
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (picked.canceled || !picked.assets[0]) return;
    const asset = picked.assets[0];
    const productId = (isNew ? form.id : id)?.trim() || 'draft';
    setUploadingImage(true);
    try {
      const url = await uploadProductImage(productId, asset.uri, asset.mimeType ?? 'image/jpeg');
      setForm((prev) => ({
        ...prev,
        images: [...(prev.images ?? []).map((u) => u.trim()).filter(Boolean), url],
      }));
    } catch (e) {
      setImageError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const updatePlan = (index: number, patch: Partial<RentalPlan>) => {
    setPlans((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const updateAddon = (index: number, patch: Partial<ProductAddon>) => {
    setAddons((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const onSave = async () => {
    setError(null);
    const productId = (isNew ? form.id : id).trim();
    if (!productId || !form.name.trim()) {
      setError('ID and name are required');
      return;
    }
    const cleanedPlans = plans
      .map((p) => ({
        ...p,
        id: p.id.trim() || `${p.hours}h`,
        label: p.label.trim() || `${p.hours} Hours`,
        hours: Math.max(1, p.hours),
        price: Math.max(0, p.price),
      }))
      .filter((p) => p.id);
    if (!cleanedPlans.length) {
      setError('Add at least one rental plan');
      return;
    }
    const perHour = Math.max(0, num(controllerPerHour));
    const flatPrice = Math.max(0, num(controllerFlat));
    const controllerDraft: ProductAddon = {
      id: 'extra-controller',
      name: 'Extra Controller',
      maxQuantity: Math.max(1, num(controllerMax) || 1),
      pricing: {
        perHour,
        perHourMaxPlanHours: Math.max(1, num(controllerHourCap) || 1),
        flatPrice,
        flatMinPlanHours: Math.max(1, num(controllerFlatFrom) || 1),
      },
    };
    controllerDraft.description = describeControllerPrice(controllerDraft);
    const controllerAddon = perHour > 0 || flatPrice > 0 ? [controllerDraft] : [];
    setSaving(true);
    try {
      const product: Product = {
        ...form,
        id: productId,
        shortName: form.shortName.trim() || form.name.trim(),
        badge: form.badge?.trim() || undefined,
        compareAtPrice: form.compareAtPrice || undefined,
        plans: cleanedPlans,
        hourly: hourly.enabled
          ? {
              enabled: true,
              firstHourPrice: Math.max(0, hourly.firstHourPrice),
              extraHourPrice: Math.max(0, hourly.extraHourPrice),
              maxHours: Math.max(1, hourly.maxHours ?? 24),
            }
          : { enabled: false, firstHourPrice: 0, extraHourPrice: 0, maxHours: 24 },
        addons: [
          ...controllerAddon,
          ...addons
          .filter((a) => a.id.trim() && a.name.trim() && !isControllerAddon(a))
          .map((a) => ({
            ...a,
            id: a.id.trim(),
            name: a.name.trim(),
            maxQuantity: Math.max(1, a.maxQuantity),
            pricing: {
              perHour: Math.max(0, a.pricing.perHour),
              perHourMaxPlanHours: Math.max(1, a.pricing.perHourMaxPlanHours),
              flatPrice: Math.max(0, a.pricing.flatPrice),
              flatMinPlanHours: Math.max(1, a.pricing.flatMinPlanHours),
            },
          })),
        ],
        tags: tagsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        requirements: requirementsText
          .split('\n')
          .map((t) => t.trim())
          .filter(Boolean),
        images: (form.images ?? []).map((u) => u.trim()).filter(Boolean),
        includes: includes
          .map((row) => ({
            title: row.title.trim(),
            detail: row.detail.trim(),
            tag: row.tag?.trim() || undefined,
          }))
          .filter((row) => row.title && row.detail),
      };
      // Drop legacy field so Firestore stores the new shape
      delete (product as { priceByDuration?: unknown }).priceByDuration;
      await saveProduct(product);
      router.replace('/admin/products' as never);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions =
    categories.length > 0
      ? categories
      : [{ id: form.categoryId || 'gaming', shortName: form.categoryId || 'gaming', name: '' }];

  return (
    <ScrollView
      style={adminStyles.page}
      contentContainerStyle={[adminStyles.scroll, { paddingHorizontal: horizontalPadding, paddingTop: spacing.xl }]}
    >
      <Text style={adminStyles.title}>{isNew ? 'New product' : 'Edit product'}</Text>
      <Text style={adminStyles.subtitle}>{isNew ? 'Plans, hourly rates, and add-ons' : id}</Text>

      <Text style={adminStyles.cardTitle}>Identity</Text>
      {isNew ? (
        <View style={adminStyles.field}>
          <Text style={adminStyles.label}>ID (slug)</Text>
          <TextInput
            style={adminStyles.input}
            value={form.id}
            onChangeText={(t) => setField('id', t.trim().toLowerCase().replace(/\s+/g, '-'))}
            placeholder="ps5-slim"
            placeholderTextColor={colors.mutedText}
            autoCapitalize="none"
          />
        </View>
      ) : null}

      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>Name</Text>
        <TextInput
          style={adminStyles.input}
          value={form.name}
          onChangeText={(t) => setField('name', t)}
          placeholderTextColor={colors.mutedText}
        />
      </View>
      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>Short name</Text>
        <TextInput
          style={adminStyles.input}
          value={form.shortName}
          onChangeText={(t) => setField('shortName', t)}
          placeholderTextColor={colors.mutedText}
        />
      </View>
      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>Description</Text>
        <TextInput
          style={[adminStyles.input, { minHeight: 100, textAlignVertical: 'top' }]}
          value={form.description}
          onChangeText={(t) => setField('description', t)}
          multiline
          placeholderTextColor={colors.mutedText}
        />
      </View>
      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>Badge (optional)</Text>
        <TextInput
          style={adminStyles.input}
          value={form.badge ?? ''}
          onChangeText={(t) => setField('badge', t)}
          placeholder="Bestseller, New…"
          placeholderTextColor={colors.mutedText}
        />
      </View>

      <Text style={adminStyles.cardTitle}>Category</Text>
      <View style={adminStyles.row}>
        {categoryOptions.map((c) => {
          const active = form.categoryId === c.id;
          return (
            <Button
              key={c.id}
              title={c.shortName || c.id}
              size="sm"
              variant={active ? 'primary' : 'secondary'}
              onPress={() => setField('categoryId', c.id)}
            />
          );
        })}
      </View>
      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>Or type category ID</Text>
        <TextInput
          style={adminStyles.input}
          value={form.categoryId}
          onChangeText={(t) => setField('categoryId', t.trim().toLowerCase())}
          autoCapitalize="none"
          placeholderTextColor={colors.mutedText}
        />
      </View>

      <Text style={adminStyles.cardTitle}>Rental plans</Text>
      <Text style={[adminStyles.subtitle, { marginBottom: spacing.sm }]}>
        Package prices customers pick on the product page
      </Text>
      <View style={[adminStyles.row, { marginBottom: spacing.md, flexWrap: 'wrap', gap: 8 }]}>
        <Button
          title="Load flyer defaults (1/3/6/12/24)"
          size="sm"
          variant="secondary"
          onPress={() =>
            setPlans(DEFAULT_PLAN_TEMPLATES.map((t) => ({ ...t, price: 0 })))
          }
        />
        <Button
          title="Add plan"
          size="sm"
          variant="secondary"
          onPress={() =>
            setPlans((prev) => [
              ...prev,
              { id: `${prev.length + 1}h`, label: 'New plan', hours: 1, price: 0 },
            ])
          }
        />
      </View>
      {plans.map((plan, index) => (
        <View key={`plan-${index}`} style={adminStyles.card}>
          <View style={adminStyles.row}>
            <View style={[adminStyles.field, { flex: 1, marginBottom: 0 }]}>
              <Text style={adminStyles.label}>ID</Text>
              <TextInput
                style={adminStyles.input}
                value={plan.id}
                onChangeText={(t) => updatePlan(index, { id: t.trim().toLowerCase() })}
                autoCapitalize="none"
                placeholderTextColor={colors.mutedText}
              />
            </View>
            <View style={[adminStyles.field, { flex: 1.4, marginBottom: 0, marginLeft: 8 }]}>
              <Text style={adminStyles.label}>Label</Text>
              <TextInput
                style={adminStyles.input}
                value={plan.label}
                onChangeText={(t) => updatePlan(index, { label: t })}
                placeholderTextColor={colors.mutedText}
              />
            </View>
          </View>
          <View style={[adminStyles.row, { marginTop: 8 }]}>
            <View style={[adminStyles.field, { flex: 1, marginBottom: 0 }]}>
              <Text style={adminStyles.label}>Hours</Text>
              <TextInput
                style={adminStyles.input}
                keyboardType="numeric"
                value={plan.hours > 0 ? String(plan.hours) : ''}
                onChangeText={(t) => updatePlan(index, { hours: num(t) })}
                placeholderTextColor={colors.mutedText}
              />
            </View>
            <View style={[adminStyles.field, { flex: 1, marginBottom: 0, marginLeft: 8 }]}>
              <Text style={adminStyles.label}>Price ₹</Text>
              <TextInput
                style={adminStyles.input}
                keyboardType="numeric"
                value={String(plan.price)}
                onChangeText={(t) => updatePlan(index, { price: num(t) })}
                placeholderTextColor={colors.mutedText}
              />
            </View>
            <View style={{ justifyContent: 'center', marginLeft: 8, paddingTop: 18 }}>
              <Text style={[adminStyles.label, { marginBottom: 4 }]}>Popular</Text>
              <Switch
                value={!!plan.popular}
                onValueChange={(v) => updatePlan(index, { popular: v })}
                trackColor={{ true: colors.playportOrange }}
              />
            </View>
          </View>
          <Pressable
            onPress={() => setPlans((prev) => prev.filter((_, i) => i !== index))}
            style={{ marginTop: 8 }}
          >
            <Text style={{ color: colors.danger }}>Remove plan</Text>
          </Pressable>
        </View>
      ))}

      <Text style={adminStyles.cardTitle}>Hourly rates</Text>
      <View style={[adminStyles.row, { marginBottom: spacing.md }]}>
        <Text style={[adminStyles.label, { marginBottom: 0, flex: 1 }]}>Enable hourly mode</Text>
        <Switch
          value={hourly.enabled}
          onValueChange={(v) => setHourly((h) => ({ ...h, enabled: v }))}
          trackColor={{ true: colors.playportOrange }}
        />
      </View>
      {hourly.enabled ? (
        <>
          <View style={adminStyles.field}>
            <Text style={adminStyles.label}>First hour ₹</Text>
            <TextInput
              style={adminStyles.input}
              keyboardType="numeric"
              value={String(hourly.firstHourPrice)}
              onChangeText={(t) => setHourly((h) => ({ ...h, firstHourPrice: num(t) }))}
              placeholderTextColor={colors.mutedText}
            />
          </View>
          <View style={adminStyles.field}>
            <Text style={adminStyles.label}>Every extra hour ₹</Text>
            <TextInput
              style={adminStyles.input}
              keyboardType="numeric"
              value={String(hourly.extraHourPrice)}
              onChangeText={(t) => setHourly((h) => ({ ...h, extraHourPrice: num(t) }))}
              placeholderTextColor={colors.mutedText}
            />
          </View>
          <View style={adminStyles.field}>
            <Text style={adminStyles.label}>Max hours</Text>
            <TextInput
              style={adminStyles.input}
              keyboardType="numeric"
              value={String(hourly.maxHours ?? 24)}
              onChangeText={(t) => setHourly((h) => ({ ...h, maxHours: num(t) || 24 }))}
              placeholderTextColor={colors.mutedText}
            />
          </View>
          <Text style={[adminStyles.subtitle, { marginBottom: spacing.md }]}>
            Extended hourly cannot convert to package prices later
          </Text>
        </>
      ) : null}

      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>Compare-at price (strike-through, optional)</Text>
        <TextInput
          style={adminStyles.input}
          keyboardType="numeric"
          value={form.compareAtPrice != null ? String(form.compareAtPrice) : ''}
          onChangeText={(t) => {
            const n = num(t);
            setField('compareAtPrice', n || undefined);
          }}
          placeholderTextColor={colors.mutedText}
        />
      </View>

      <Text style={adminStyles.cardTitle}>Extra controller for this product</Text>
      <Text style={[adminStyles.subtitle, { marginBottom: spacing.md }]}>
        This price is only for this kit. Leave both amounts at 0 to hide extra controllers on the product page.
      </Text>
      <Text style={adminStyles.label}>₹ per hour, used until the hour cap</Text>
      <View style={adminStyles.row}>
        <TextInput
          style={[adminStyles.input, { flex: 1 }]}
          keyboardType="numeric"
          value={controllerPerHour}
          onChangeText={setControllerPerHour}
          placeholder="20"
          placeholderTextColor={colors.mutedText}
        />
        <TextInput
          style={[adminStyles.input, { flex: 1, marginLeft: 8 }]}
          keyboardType="numeric"
          value={controllerHourCap}
          onChangeText={setControllerHourCap}
          placeholder="Up to hours"
          placeholderTextColor={colors.mutedText}
        />
      </View>
      <Text style={[adminStyles.label, { marginTop: 8 }]}>Flat ₹, used from this many hours</Text>
      <View style={adminStyles.row}>
        <TextInput
          style={[adminStyles.input, { flex: 1 }]}
          keyboardType="numeric"
          value={controllerFlat}
          onChangeText={setControllerFlat}
          placeholder="150"
          placeholderTextColor={colors.mutedText}
        />
        <TextInput
          style={[adminStyles.input, { flex: 1, marginLeft: 8 }]}
          keyboardType="numeric"
          value={controllerFlatFrom}
          onChangeText={setControllerFlatFrom}
          placeholder="From hours"
          placeholderTextColor={colors.mutedText}
        />
      </View>
      <View style={[adminStyles.field, { marginTop: 8 }]}>
        <Text style={adminStyles.label}>Max extra controllers a customer can add</Text>
        <TextInput
          style={adminStyles.input}
          keyboardType="numeric"
          value={controllerMax}
          onChangeText={setControllerMax}
          placeholder="3"
          placeholderTextColor={colors.mutedText}
        />
      </View>
      <ControllerPricePreview
        perHour={controllerPerHour}
        hourCap={controllerHourCap}
        flat={controllerFlat}
        flatFrom={controllerFlatFrom}
        plans={plans}
      />

      <Text style={adminStyles.cardTitle}>Physical units and games</Text>
      <Text style={[adminStyles.subtitle, { marginBottom: spacing.md }]}>
        Customers pick a unit on the product page and see only the games saved on that unit.
      </Text>
      {isNew ? (
        <Text style={[adminStyles.subtitle, { marginBottom: spacing.lg }]}>
          Save the product first, then add PS4 #1, PS4 #2, and their games here.
        </Text>
      ) : (
        <View style={{ gap: spacing.md, marginBottom: spacing.lg }}>
          {units.filter((u) => u.productId === id).map((unit) => (
            <View key={unit.id} style={adminStyles.card}>
              <UnitGamesEditor
                unit={unit}
                productName={form.shortName || form.name}
                onSave={(games) => saveUnit({ ...unit, games, updatedAt: new Date().toISOString() })}
              />
            </View>
          ))}
          <View style={adminStyles.card}>
            <Text style={adminStyles.label}>Add a unit number</Text>
            <TextInput
              style={adminStyles.input}
              value={unitNumber}
              onChangeText={setUnitNumber}
              placeholder="001"
              placeholderTextColor={colors.mutedText}
              keyboardType="numeric"
            />
            <Button
              title="Create unit"
              size="sm"
              variant="secondary"
              onPress={() => {
                const n = unitNumber.padStart(3, '0');
                const now = new Date().toISOString();
                const skuLabel = `${(form.shortName || form.name || id).toUpperCase().replace(/\s+/g, '-')}-${n}`;
                void saveUnit({
                  id: `${id}-${n}`,
                  productId: id,
                  hubId: hubs[0]?.id ?? 'indiranagar',
                  skuLabel,
                  status: 'available',
                  games: [],
                  createdAt: now,
                  updatedAt: now,
                });
                setUnitNumber(String(Number(n) + 1).padStart(3, '0'));
              }}
            />
          </View>
        </View>
      )}

      <Text style={adminStyles.cardTitle}>Add-ons</Text>
      <View style={[adminStyles.row, { marginBottom: spacing.md, flexWrap: 'wrap', gap: 8 }]}>
        <Button
          title="Add blank add-on"
          size="sm"
          variant="secondary"
          onPress={() =>
            setAddons((prev) => [
              ...prev,
              {
                id: `addon-${prev.length + 1}`,
                name: '',
                maxQuantity: 2,
                pricing: {
                  perHour: 20,
                  perHourMaxPlanHours: 6,
                  flatPrice: 150,
                  flatMinPlanHours: 12,
                },
              },
            ])
          }
        />
      </View>
      {addons.map((addon, index) => (
        <View key={`addon-${index}`} style={adminStyles.card}>
          <View style={adminStyles.field}>
            <Text style={adminStyles.label}>ID</Text>
            <TextInput
              style={adminStyles.input}
              value={addon.id}
              onChangeText={(t) => updateAddon(index, { id: t.trim().toLowerCase() })}
              autoCapitalize="none"
              placeholderTextColor={colors.mutedText}
            />
          </View>
          <View style={adminStyles.field}>
            <Text style={adminStyles.label}>Name</Text>
            <TextInput
              style={adminStyles.input}
              value={addon.name}
              onChangeText={(t) => updateAddon(index, { name: t })}
              placeholderTextColor={colors.mutedText}
            />
          </View>
          <View style={adminStyles.field}>
            <Text style={adminStyles.label}>Description</Text>
            <TextInput
              style={adminStyles.input}
              value={addon.description ?? ''}
              onChangeText={(t) => updateAddon(index, { description: t })}
              placeholderTextColor={colors.mutedText}
            />
          </View>
          <View style={adminStyles.field}>
            <Text style={adminStyles.label}>Max quantity</Text>
            <TextInput
              style={adminStyles.input}
              keyboardType="numeric"
              value={String(addon.maxQuantity)}
              onChangeText={(t) => updateAddon(index, { maxQuantity: num(t) || 1 })}
              placeholderTextColor={colors.mutedText}
            />
          </View>
          <Text style={adminStyles.label}>Per-hour ₹ (when plan hours ≤ threshold)</Text>
          <View style={adminStyles.row}>
            <TextInput
              style={[adminStyles.input, { flex: 1 }]}
              keyboardType="numeric"
              value={String(addon.pricing.perHour)}
              onChangeText={(t) =>
                updateAddon(index, {
                  pricing: { ...addon.pricing, perHour: num(t) },
                })
              }
              placeholderTextColor={colors.mutedText}
            />
            <TextInput
              style={[adminStyles.input, { flex: 1, marginLeft: 8 }]}
              keyboardType="numeric"
              value={String(addon.pricing.perHourMaxPlanHours)}
              onChangeText={(t) =>
                updateAddon(index, {
                  pricing: { ...addon.pricing, perHourMaxPlanHours: num(t) || 6 },
                })
              }
              placeholder="Max hrs"
              placeholderTextColor={colors.mutedText}
            />
          </View>
          <Text style={[adminStyles.label, { marginTop: 8 }]}>
            Flat ₹ (when plan hours ≥ threshold)
          </Text>
          <View style={adminStyles.row}>
            <TextInput
              style={[adminStyles.input, { flex: 1 }]}
              keyboardType="numeric"
              value={String(addon.pricing.flatPrice)}
              onChangeText={(t) =>
                updateAddon(index, {
                  pricing: { ...addon.pricing, flatPrice: num(t) },
                })
              }
              placeholderTextColor={colors.mutedText}
            />
            <TextInput
              style={[adminStyles.input, { flex: 1, marginLeft: 8 }]}
              keyboardType="numeric"
              value={String(addon.pricing.flatMinPlanHours)}
              onChangeText={(t) =>
                updateAddon(index, {
                  pricing: { ...addon.pricing, flatMinPlanHours: num(t) || 12 },
                })
              }
              placeholder="Min hrs"
              placeholderTextColor={colors.mutedText}
            />
          </View>
          <Pressable
            onPress={() => setAddons((prev) => prev.filter((_, i) => i !== index))}
            style={{ marginTop: 8 }}
          >
            <Text style={{ color: colors.danger }}>Remove add-on</Text>
          </Pressable>
        </View>
      ))}

      <Text style={adminStyles.cardTitle}>Media & discovery</Text>
      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>Product photos</Text>
        <Text style={[adminStyles.cardMeta, { marginBottom: 8 }]}>
          Upload a picture from your device. JPG, PNG, or WEBP, under 5 MB.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {(form.images ?? []).filter((uri) => uri.trim()).map((uri) => (
            <View key={uri} style={{ width: 96 }}>
              <Image
                source={{ uri }}
                style={{ width: 96, height: 96, borderRadius: radii.md, backgroundColor: colors.surfaceAlt }}
                contentFit="cover"
              />
              <Pressable
                onPress={() =>
                  setForm((prev) => ({
                    ...prev,
                    images: (prev.images ?? []).filter((item) => item !== uri),
                  }))
                }
                style={{ marginTop: 4 }}
              >
                <Text style={{ color: colors.danger, fontSize: 12 }}>Remove</Text>
              </Pressable>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 10, alignSelf: 'flex-start' }}>
          <Button
            title={uploadingImage ? 'Uploading…' : 'Upload image'}
            variant="secondary"
            disabled={uploadingImage}
            onPress={() => void onUploadImage()}
          />
        </View>
        {imageError ? <Text style={{ color: colors.danger, marginTop: 8 }}>{imageError}</Text> : null}
      </View>
      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>Tags (comma-separated)</Text>
        <TextInput
          style={adminStyles.input}
          value={tagsText}
          onChangeText={setTagsText}
          placeholderTextColor={colors.mutedText}
        />
      </View>
      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>Availability label</Text>
        <TextInput
          style={adminStyles.input}
          value={form.availabilityLabel}
          onChangeText={(t) => setField('availabilityLabel', t)}
          placeholder="3 units at hub"
          placeholderTextColor={colors.mutedText}
        />
      </View>
      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>ETA minutes</Text>
        <TextInput
          style={adminStyles.input}
          keyboardType="numeric"
          value={String(form.etaMinutes ?? 30)}
          onChangeText={(t) => setField('etaMinutes', num(t) || 30)}
          placeholderTextColor={colors.mutedText}
        />
      </View>
      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>Rating (display)</Text>
        <TextInput
          style={adminStyles.input}
          keyboardType="decimal-pad"
          value={String(form.rating ?? 0)}
          onChangeText={(t) => setField('rating', Number(t) || 0)}
          placeholderTextColor={colors.mutedText}
        />
      </View>
      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>Review count (display)</Text>
        <TextInput
          style={adminStyles.input}
          keyboardType="numeric"
          value={String(form.reviewCount ?? 0)}
          onChangeText={(t) => setField('reviewCount', num(t))}
          placeholderTextColor={colors.mutedText}
        />
      </View>

      <Text style={adminStyles.cardTitle}>What’s included</Text>
      {includes.map((row, index) => (
        <View key={`inc-${index}`} style={adminStyles.card}>
          <TextInput
            style={adminStyles.input}
            value={row.title}
            onChangeText={(t) =>
              setIncludes((prev) => prev.map((r, i) => (i === index ? { ...r, title: t } : r)))
            }
            placeholder="Title"
            placeholderTextColor={colors.mutedText}
          />
          <TextInput
            style={[adminStyles.input, { marginTop: 8 }]}
            value={row.detail}
            onChangeText={(t) =>
              setIncludes((prev) => prev.map((r, i) => (i === index ? { ...r, detail: t } : r)))
            }
            placeholder="Detail"
            placeholderTextColor={colors.mutedText}
          />
          <TextInput
            style={[adminStyles.input, { marginTop: 8 }]}
            value={row.tag ?? ''}
            onChangeText={(t) =>
              setIncludes((prev) => prev.map((r, i) => (i === index ? { ...r, tag: t } : r)))
            }
            placeholder="Tag (optional)"
            placeholderTextColor={colors.mutedText}
          />
          <Pressable
            onPress={() => setIncludes((prev) => prev.filter((_, i) => i !== index))}
            style={{ marginTop: 8 }}
          >
            <Text style={{ color: colors.danger }}>Remove</Text>
          </Pressable>
        </View>
      ))}
      <Button
        title="Add include row"
        size="sm"
        variant="secondary"
        onPress={() => setIncludes((prev) => [...prev, { title: '', detail: '', tag: '' }])}
      />

      <Text style={[adminStyles.cardTitle, { marginTop: spacing.lg }]}>Requirements</Text>
      <View style={adminStyles.field}>
        <Text style={adminStyles.label}>One requirement per line</Text>
        <TextInput
          style={[adminStyles.input, { minHeight: 88, textAlignVertical: 'top' }]}
          value={requirementsText}
          onChangeText={setRequirementsText}
          multiline
          placeholder="TV with HDMI&#10;Power outlet"
          placeholderTextColor={colors.mutedText}
        />
      </View>

      <Text style={adminStyles.cardTitle}>Flags</Text>
      <View style={[adminStyles.row, { marginBottom: spacing.md }]}>
        <Text style={[adminStyles.label, { marginBottom: 0, flex: 1 }]}>Featured</Text>
        <Switch
          value={!!form.featured}
          onValueChange={(v) => setField('featured', v)}
          trackColor={{ true: colors.playportOrange }}
        />
      </View>
      <View style={[adminStyles.row, { marginBottom: spacing.md }]}>
        <Text style={[adminStyles.label, { marginBottom: 0, flex: 1 }]}>Popular</Text>
        <Switch
          value={!!form.popular}
          onValueChange={(v) => setField('popular', v)}
          trackColor={{ true: colors.playportOrange }}
        />
      </View>

      {error ? <Text style={adminStyles.error}>{error}</Text> : null}

      <View style={adminStyles.row}>
        <Button title="Cancel" variant="ghost" size="sm" onPress={() => router.back()} />
        <Button title={saving ? 'Saving…' : 'Save product'} size="sm" disabled={saving} onPress={() => void onSave()} />
      </View>
    </ScrollView>
  );
}

function ControllerPricePreview({
  perHour,
  hourCap,
  flat,
  flatFrom,
  plans,
}: {
  perHour: string;
  hourCap: string;
  flat: string;
  flatFrom: string;
  plans: RentalPlan[];
}) {
  const draft: ProductAddon = {
    id: 'extra-controller',
    name: 'Extra Controller',
    maxQuantity: 1,
    pricing: {
      perHour: Math.max(0, num(perHour)),
      perHourMaxPlanHours: Math.max(1, num(hourCap) || 1),
      flatPrice: Math.max(0, num(flat)),
      flatMinPlanHours: Math.max(1, num(flatFrom) || 1),
    },
  };
  if (draft.pricing.perHour <= 0 && draft.pricing.flatPrice <= 0) {
    return (
      <Text style={[adminStyles.subtitle, { marginTop: 8, marginBottom: spacing.lg }]}>
        Hidden on the product page until you set an hourly or flat price.
      </Text>
    );
  }
  return (
    <View style={{ marginTop: 8, marginBottom: spacing.lg, gap: 4 }}>
      <Text style={adminStyles.label}>Customer sees</Text>
      <Text style={adminStyles.cardMeta}>{describeControllerPrice(draft)}</Text>
      {plans
        .filter((p) => p.hours > 0)
        .map((p) => (
          <Text key={p.id || String(p.hours)} style={adminStyles.cardMeta}>
            {p.label || `${p.hours}h`} · {formatINR(priceForAddon(draft, p.hours, 1))} each
          </Text>
        ))}
    </View>
  );
}
