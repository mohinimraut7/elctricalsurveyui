import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, Loader2, Lock, Phone, User, IdCard } from 'lucide-react'
import AuthShell from './AuthShell'
import Field from './Field'
import { useRegisterMutation } from '../../services/api'
import { errMsg } from '../../utils/format'

const validate = (f) => {
  const e = {}
  if (!f.fullName.trim()) e.fullName = 'Full name आवश्यक'
  if (!/^[a-z0-9_.]{3,30}$/i.test(f.userName.trim())) e.userName = '3–30 letters, numbers, _ किंवा .'
  if (f.mobileNumber && !/^[6-9]\d{9}$/.test(f.mobileNumber)) e.mobileNumber = 'Valid 10-digit mobile number'
  if (f.password.length < 6) e.password = 'किमान 6 characters'
  if (f.password !== f.confirm) e.confirm = 'Passwords match होत नाहीत'
  return e
}

export default function Register() {
  const navigate = useNavigate()
  const [register, { isLoading }] = useRegisterMutation()
  const [form, setForm] = useState({ fullName: '', userName: '', mobileNumber: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: name === 'mobileNumber' ? value.replace(/\D/g, '').slice(0, 10) : value }))
    if (errors[name]) setErrors((x) => ({ ...x, [name]: undefined }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const v = validate(form)
    setErrors(v)
    if (Object.keys(v).length) return
    try {
      const { confirm: _c, ...body } = form
      const res = await register({ ...body, userName: body.userName.trim().toLowerCase() }).unwrap()
      navigate('/login', { replace: true, state: { registered: res.message, userName: body.userName.trim().toLowerCase() } })
    } catch (err) {
      setError(errMsg(err))
    }
  }

  return (
    <AuthShell>
      <h2 className="font-display text-2xl font-bold text-ink-900">Create account</h2>
      <p className="mt-1 text-sm text-ink-500">New accounts get read-only (Viewer) access</p>

      {error && (
        <div className="mt-5 flex animate-fade-in items-start gap-2 rounded-xl border border-[#efc9c5] bg-[#fbefee] px-3.5 py-3 text-xs text-status-bad">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-3.5" noValidate>
        <Field label="Full name" icon={IdCard} name="fullName" value={form.fullName} onChange={onChange} error={errors.fullName} autoComplete="name" />
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Username" icon={User} name="userName" value={form.userName} onChange={onChange} error={errors.userName} autoComplete="username" />
          <Field label="Mobile (optional)" icon={Phone} name="mobileNumber" value={form.mobileNumber} onChange={onChange} error={errors.mobileNumber} inputMode="numeric" autoComplete="tel" />
        </div>
        <Field label="Password" icon={Lock} type="password" name="password" value={form.password} onChange={onChange} error={errors.password} autoComplete="new-password" />
        <Field label="Confirm password" icon={Lock} type="password" name="confirm" value={form.confirm} onChange={onChange} error={errors.confirm} autoComplete="new-password" />

        <button type="submit" disabled={isLoading} className="btn-primary group mt-2 h-[46px] w-full rounded-2xl">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? 'Creating…' : 'Register'}
          {!isLoading && <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-brand-700 transition-colors hover:text-gold-600">Sign in</Link>
      </p>
    </AuthShell>
  )
}
