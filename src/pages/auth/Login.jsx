import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { AlertCircle, ArrowRight, Loader2, Lock, User, CheckCircle2 } from 'lucide-react'
import AuthShell from './AuthShell'
import Field from './Field'
import { useLoginMutation } from '../../services/api'
import { setCredentials } from '../../features/auth/authSlice'
import { errMsg } from '../../utils/format'
import { Dashboard } from '../../routes/lazyPages'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [login, { isLoading }] = useLoginMutation()
  const [form, setForm] = useState({ userName: location.state?.userName || '', password: '' })
  const [error, setError] = useState('')
  const registered = location.state?.registered

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.userName.trim() || !form.password) return setError('Username / email आणि password भरा')
    try {
      const res = await login({ userName: form.userName.trim(), password: form.password }).unwrap()
      dispatch(setCredentials({ token: res.token, user: res.user }))
      const from = location.state?.from?.pathname
      navigate(from && from !== '/login' ? from : '/dashboard', { replace: true })
    } catch (err) {
      setError(errMsg(err))
    }
  }

  return (
    <AuthShell>
      <h2 className="font-display text-2xl font-bold text-ink-900">Welcome back</h2>
      <p className="mt-1 text-sm text-ink-500">Sign in to the Electrical Survey Portal</p>

      {registered && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-3 text-xs text-brand-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {registered}
        </div>
      )}
      {error && (
        <div className="mt-5 flex animate-fade-in items-start gap-2 rounded-xl border border-[#efc9c5] bg-[#fbefee] px-3.5 py-3 text-xs text-status-bad">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <Field label="Username or email" icon={User} name="userName" value={form.userName} onChange={onChange} autoComplete="username" placeholder="e.g. admin or warda@gmail.com" autoFocus />
        <Field label="Password" icon={Lock} type="password" name="password" value={form.password} onChange={onChange} autoComplete="current-password" placeholder="••••••••" />

        <button
          type="submit"
          disabled={isLoading}
          onMouseEnter={() => Dashboard.preload()}
          className="btn-primary group mt-2 h-[46px] w-full rounded-2xl"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isLoading ? 'Signing in…' : 'Sign in'}
          {!isLoading && <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        New user?{' '}
        <Link to="/register" className="font-semibold text-brand-700 transition-colors hover:text-gold-600">
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}
