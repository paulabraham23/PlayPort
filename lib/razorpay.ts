export type RazorpayCheckoutResult = {
  paymentId: string;
  razorpayOrderId: string;
  signature: string;
};

type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export async function openRazorpayCheckout(opts: {
  keyId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  orderId: string;
  name: string;
  phone: string;
  description?: string;
}): Promise<RazorpayCheckoutResult> {
  await loadRazorpayScript();
  const RazorpayCtor = (
    window as unknown as {
      Razorpay: new (o: object) => { open: () => void };
    }
  ).Razorpay;
  return new Promise<RazorpayCheckoutResult>((resolve, reject) => {
    const rzp = new RazorpayCtor({
      key: opts.keyId,
      amount: opts.amount,
      currency: opts.currency,
      name: 'PlayPort',
      description: opts.description ?? `Order ${opts.orderId}`,
      order_id: opts.razorpayOrderId,
      prefill: { name: opts.name, contact: opts.phone.replace(/\D/g, '').slice(-10) },
      handler: (response: RazorpaySuccess) =>
        resolve({
          paymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        }),
      modal: { ondismiss: () => reject(new Error('Payment dismissed')) },
    });
    rzp.open();
  });
}

function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('Razorpay requires web'));
      return;
    }
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}
