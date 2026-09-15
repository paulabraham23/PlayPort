import { Redirect } from 'expo-router';

/** Always open into the shop — login is requested only for gated actions. */
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
