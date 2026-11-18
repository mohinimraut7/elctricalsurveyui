import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Loader2, UserPlus, X } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import DataTable from '../../components/common/DataTable'
import ErrorState from '../../components/common/ErrorState'
import Badge from '../../components/common/Badge'
import { useCreateUserMutation, useGetUsersQuery, useUpdateUserMutation } from '../../services/api'
import { selectUser } from '../../features/auth/authSlice'
import { ROLE_LABELS, WARDS } from '../../utils/constants'
import { errMsg, fmtDate } from '../../utils/format'

const EMPTY = { fullName: '', userName: '', email: '', mobileNumber: '', password: '', role: 'ward_engineer', ward: '' }
const needsWard = (role) => role === 'ward_engineer' || role === 'surveyor'

function CreateUser({ onClose }) {
  const [createUser, { isLoading }] = useCreateUserMutation()
  const [f, setF] = useState(EMPTY)
  const [error, setError] = useState('')
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createUser(f).unwrap()
      onClose()
    } catch (err) {
      setError(errMsg(err))
    }
  }

  return (
    <form onSubmit={submit} className="card animate-slide-up space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold">New user</h3>
        <button type="button" onClick={onClose} className="text-ink-400 hover:text-ink-700"><X className="h-5 w-5" /></button>
      </div>
      {error && <p className="rounded-lg bg-[#fbefee] px-3 py-2 text-xs text-status-bad">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input className="input" placeholder="Full name" value={f.fullName} onChange={set('fullName')} required />
        <input className="input" placeholder="Username" value={f.userName} onChange={set('userName')} required />
        <input className="input" placeholder="Mobile" value={f.mobileNumber} onChange={set('mobileNumber')} />
        <input className="input" type="email" placeholder="Email (optional)" value={f.email} onChange={set('email')} />
        <input className="input" type="password" placeholder="Password" value={f.password} onChange={set('password')} required minLength={6} />
        <select className="select h-10" value={f.role} onChange={set('role')}>
          {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="select h-10" value={f.ward} onChange={set('ward')} disabled={!needsWard(f.role)}>
          <option value="">Select ward</option>
          {WARDS.map((w) => <option key={w}>{w}</option>)}
        </select>
      </div>
      <div className="flex justify-end">
        <button disabled={isLoading} className="btn-primary">{isLoading && <Loader2 className="h-4 w-4 animate-spin" />} Create user</button>
      </div>
    </form>
  )
}

export default function UserManagement() {
  const me = useSelector(selectUser)
  const { data = [], isLoading, isFetching, error, refetch } = useGetUsersQuery()
  const [updateUser] = useUpdateUserMutation()
  const [creating, setCreating] = useState(false)

  const save = async (id, patch) => {
    try {
      await updateUser({ id, ...patch }).unwrap()
    } catch (err) {
      alert(errMsg(err))
    }
  }

  const columns = useMemo(
    () => [
      {
        key: 'fullName',
        header: 'User',
        render: (u) => (
          <div>
            <div className="font-medium text-ink-900">{u.fullName}</div>
            <div className="text-[11px] text-ink-400">@{u.userName}{u.email && ` · ${u.email}`}{u.mobileNumber && ` · ${u.mobileNumber}`}</div>
          </div>
        ),
      },
      {
        key: 'role',
        header: 'Role',
        render: (u) => (
          <select
            className="select h-8"
            value={u.role}
            disabled={u._id === me?.id}
            onChange={(e) => save(u._id, { role: e.target.value, ...(!needsWard(e.target.value) ? { ward: '' } : {}) })}
          >
            {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        ),
      },
      {
        key: 'ward',
        header: 'Ward',
        render: (u) =>
          needsWard(u.role) ? (
            <select className="select h-8" value={u.ward} onChange={(e) => save(u._id, { ward: e.target.value })}>
              <option value="">—</option>
              {WARDS.map((w) => <option key={w}>{w}</option>)}
            </select>
          ) : (
            <span className="text-xs text-ink-400">All wards</span>
          ),
      },
      {
        key: 'isActive',
        header: 'Status',
        render: (u) => (
          <button
            disabled={u._id === me?.id}
            onClick={() => save(u._id, { isActive: !u.isActive })}
            className="disabled:cursor-not-allowed"
            title={u.isActive ? 'Click to deactivate' : 'Click to activate'}
          >
            <Badge tone={u.isActive ? 'green' : 'warn'}>{u.isActive ? 'Active' : 'Pending / Inactive'}</Badge>
          </button>
        ),
      },
      { key: 'createdAt', header: 'Joined', render: (u) => <span className="text-xs text-ink-500">{fmtDate(u.createdAt)}</span> },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [me?.id]
  )

  return (
    <div className="space-y-5">
      <PageHeader
        title="User Management"
        subtitle="Approve registrations, assign Ward Engineers / Surveyors to wards"
        actions={!creating && <button onClick={() => setCreating(true)} className="btn-primary"><UserPlus className="h-4 w-4" /> Add user</button>}
      />
      {creating && <CreateUser onClose={() => setCreating(false)} />}
      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="card overflow-hidden rounded-3xl">
          <DataTable columns={columns} data={data} loading={isLoading} fetching={isFetching} emptyMessage="No users" />
        </div>
      )}
    </div>
  )
}
