import { Plus, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { PanelHeader } from '../components/ui/PanelHeader'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { budgetTypes } from '../data/constants'
import type { BudgetType, Category, SettingsState } from '../types'
import { formatMoney } from '../utils/format'
import { slugify } from '../utils/id'
import { buildSalaryPlans } from '../utils/models'

export function Setup({
  settings,
  salaryPlans,
  onUpdateSettings,
}: {
  settings: SettingsState
  salaryPlans: ReturnType<typeof buildSalaryPlans>
  onUpdateSettings: (settings: Partial<SettingsState>) => void
}) {
  function updateCategory(id: string, patch: Partial<Category>) {
    onUpdateSettings({
      categories: settings.categories.map((category) => (category.id === id ? { ...category, ...patch } : category)),
    })
  }

  function addCategory() {
    onUpdateSettings({
      categories: [
        ...settings.categories,
        {
          id: slugify(`category-${Date.now()}`),
          name: 'New Category',
          type: 'Need',
          color: '#14532d',
        },
      ],
    })
  }

  function removeCategory(id: string) {
    if (settings.categories.length <= 1) return
    onUpdateSettings({ categories: settings.categories.filter((category) => category.id !== id) })
  }

  function addPaymentMode() {
    onUpdateSettings({ paymentModes: [...settings.paymentModes, 'New Mode'] })
  }

  function updatePaymentMode(index: number, value: string) {
    onUpdateSettings({ paymentModes: settings.paymentModes.map((mode, currentIndex) => (currentIndex === index ? value : mode)) })
  }

  function removePaymentMode(index: number) {
    if (settings.paymentModes.length <= 1) return
    onUpdateSettings({ paymentModes: settings.paymentModes.filter((_, currentIndex) => currentIndex !== index) })
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,.75fr)]">
      <Card><CardHeader><PanelHeader title="Income Plan" action="5 years" /></CardHeader><CardContent className="grid gap-4">
          <SetupField id="budget-cycle-type" label="Budget Cycle Type">
            <Select value={settings.budgetCycleType} onValueChange={(value) => onUpdateSettings({ budgetCycleType: value as SettingsState['budgetCycleType'] })}>
              <SelectTrigger id="budget-cycle-type" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="calendar">Calendar Month</SelectItem>
                <SelectItem value="salary">Salary Cycle (credit to credit)</SelectItem>
              </SelectContent>
            </Select>
          </SetupField>
          <SetupField id="start-year" label="Start Year"><Input id="start-year" type="number" value={settings.startYear} onChange={(event) => onUpdateSettings({ startYear: Number(event.target.value) })} /></SetupField>
          <SetupField id="salary" label="Salary"><Input id="salary" type="number" value={settings.salary} onChange={(event) => onUpdateSettings({ salary: Number(event.target.value) })} /></SetupField>
          <SetupField id="growth" label="Annual Growth %"><Input id="growth" type="number" value={settings.salaryGrowth} onChange={(event) => onUpdateSettings({ salaryGrowth: Number(event.target.value) })} /></SetupField>
          <SetupField id="weekly-limit" label="Weekly Limit"><Input id="weekly-limit" type="number" value={settings.weeklyLimit} onChange={(event) => onUpdateSettings({ weeklyLimit: Number(event.target.value) })} /></SetupField>
      </CardContent></Card>

      <Card className="min-w-0"><CardHeader><PanelHeader title="50 / 30 / 20 Projection" action="Setup sheet" /></CardHeader><CardContent>
        <Table><TableHeader><TableRow><TableHead>Year</TableHead><TableHead>Salary</TableHead><TableHead>Needs</TableHead><TableHead>Wants</TableHead><TableHead>Savings</TableHead></TableRow></TableHeader><TableBody>
          {salaryPlans.map((plan) => (
            <TableRow key={plan.year}><TableCell>{plan.year}</TableCell><TableCell>{formatMoney(plan.salary)}</TableCell><TableCell>{formatMoney(plan.need)}</TableCell><TableCell>{formatMoney(plan.want)}</TableCell><TableCell>{formatMoney(plan.saving)}</TableCell></TableRow>
          ))}
        </TableBody></Table>
      </CardContent></Card>

      <Card className="min-w-0"><CardHeader><PanelHeader
          title="Categories"
          action={
            <Button size="sm" type="button" onClick={addCategory}><Plus size={14} /> Add</Button>
          }
        /></CardHeader><CardContent className="grid gap-3">
          {settings.categories.map((category) => (
            <div className="grid grid-cols-[44px_minmax(0,1fr)_130px_36px] items-center gap-2 max-sm:grid-cols-[44px_minmax(0,1fr)]" key={category.id}>
              <Input aria-label={`${category.name} color`} className="w-11 p-1" type="color" value={category.color} onChange={(event) => updateCategory(category.id, { color: event.target.value })} />
              <Input aria-label="Category name" value={category.name} onChange={(event) => updateCategory(category.id, { name: event.target.value })} />
              <Select value={category.type} onValueChange={(value) => updateCategory(category.id, { type: value as BudgetType })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>
                {budgetTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent></Select>
              <Button aria-label={`Delete ${category.name}`} className="hover:bg-destructive/10 hover:text-destructive" size="icon-sm" variant="outline" type="button" onClick={() => removeCategory(category.id)} title="Delete category"><Trash2 size={16} /></Button>
            </div>
          ))}
        </CardContent></Card>

      <Card><CardHeader><PanelHeader
          title="Payment Modes"
          action={
            <Button size="sm" type="button" onClick={addPaymentMode}><Plus size={14} /> Add</Button>
          }
        /></CardHeader><CardContent className="grid gap-3">
          {settings.paymentModes.map((mode, index) => (
            <div className="grid grid-cols-[minmax(0,1fr)_36px] items-center gap-2" key={`${mode}-${index}`}>
              <Input aria-label="Payment mode" value={mode} onChange={(event) => updatePaymentMode(index, event.target.value)} />
              <Button aria-label={`Delete ${mode}`} className="hover:bg-destructive/10 hover:text-destructive" size="icon-sm" variant="outline" type="button" onClick={() => removePaymentMode(index)} title="Delete payment mode"><Trash2 size={16} /></Button>
            </div>
          ))}
        </CardContent></Card>
    </div>
  )
}

function SetupField({ children, id, label }: { children: ReactNode; id: string; label: string }) {
  return <div className="grid gap-1.5"><Label htmlFor={id}>{label}</Label>{children}</div>
}
