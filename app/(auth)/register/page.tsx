'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authApi } from '../../../lib/api';
import { useAuthStore } from '../../../store/auth.store';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

const roles = [
  { value: 'ATTENDEE', label: '🎪 Attendee', desc: 'Buy & view tickets' },
  { value: 'ORGANIZER', label: '🎭 Organizer', desc: 'Create & manage events' },
  { value: 'GATE_AGENT', label: '📷 Gate Agent', desc: 'Scan tickets at gate' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', phone: '', role: 'ATTENDEE',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName) e.firstName = 'Required';
    if (!form.lastName) e.lastName = 'Required';
    if (!form.email) e.email = 'Required';
    if (!form.password || form.password.length < 8) e.password = 'Minimum 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authApi.register(form);
      const { accessToken, user } = res.data;
      setAuth(accessToken, user);
      toast.success(`Welcome to MuGina, ${user.firstName}!`);
      if (user.role === 'ORGANIZER') router.push('/organizer/dashboard');
      else if (user.role === 'GATE_AGENT') router.push('/scan');
      else router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark px-4 py-8">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-brand-gold text-4xl font-black">MuGina</h1>
          <p className="text-gray-400 text-sm mt-1">Create your account</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" placeholder="John" value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })} error={errors.firstName} />
              <Input label="Last Name" placeholder="Doe" value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })} error={errors.lastName} />
            </div>

            <Input label="Email" type="email" placeholder="john@example.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />

            <Input label="Phone (optional)" type="tel" placeholder="+233201234567" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />

            <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">I am a...</p>
              <div className="space-y-2">
                {roles.map((r) => (
                  <label key={r.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    form.role === r.value ? 'border-brand-gold bg-primary/10' : 'border-gray-200'
                  }`}>
                    <input type="radio" name="role" value={r.value} checked={form.role === r.value}
                      onChange={(e) => setForm({ ...form, role: e.target.value })} className="hidden" />
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{r.label}</div>
                      <div className="text-xs text-gray-500">{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-gold font-semibold">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
