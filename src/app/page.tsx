import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to /users - middleware will handle auth check
  redirect('/users');
}
