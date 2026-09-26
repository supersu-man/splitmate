import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ApiService } from 'src/app/service/api.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SliderModule } from 'primeng/slider';
import { DecimalPipe } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { Expense } from 'src/app/interface/interface';

interface ShareForm {
  id: FormControl<string | null>;
  share: FormControl<number | null>;
  amount: FormControl<number | null>;
  fixed: FormControl<boolean | null>;
}

interface MemberSelectable {
  id: string;
  name: string;
  included: boolean;
}

@Component({
  selector: 'app-expense',
  imports: [InputTextModule, SelectModule, FormsModule, CheckboxModule, ButtonModule, RouterLink, ReactiveFormsModule, RadioButtonModule, SliderModule, DecimalPipe, DatePickerModule],
  templateUrl: './expense.component.html',
  styles: ``
})
export class ExpenseComponent implements OnInit {

  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  // Inputs bound automatically from route params
  readonly groupId = input.required<string>();
  readonly expenseId = input<string | null>(null);

  // Reactive group lookup
  readonly currentGroup = computed(() => {
    return this.apiService.groups().find(g => g.id === this.groupId());
  });

  // Reactive member name map
  readonly memberNameMap = computed<Map<string, string>>(() => {
    const map = new Map<string, string>();
    const g = this.currentGroup();
    if (g) {
      g.members.forEach(m => map.set(m.id, m.name));
    }
    return map;
  });

  // Local signal for members inclusion in this expense
  readonly members = signal<MemberSelectable[]>([]);

  // Computed helper for checking at least one member selected
  readonly atleastOneMemberIncluded = computed(() => {
    return this.members().some(x => x.included);
  });

  readonly expenseForm = new FormGroup({
    id: new FormControl<string | null>(null),
    amount: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    description: new FormControl<string | null>(null, Validators.required),
    paidBy: new FormControl<string | null>(null, Validators.required),
    date: new FormControl<Date | null>(new Date(), Validators.required),
    shares: new FormArray<FormGroup<ShareForm>>([]),
  });

  get shares(): FormArray<FormGroup<ShareForm>> {
    return this.expenseForm.get('shares') as FormArray<FormGroup<ShareForm>>;
  }

  ngOnInit(): void {
    const group = this.currentGroup() || this.apiService.getGroup(this.groupId());
    if (!group) return;

    const initialMembers: MemberSelectable[] = group.members.map(m => ({ ...m, included: false }));
    const currentExpId = this.expenseId();

    if (currentExpId) {
      const expense = this.apiService.getExpense(this.groupId(), currentExpId);
      if (expense) {
        const clonedExpense = {
          ...expense,
          date: new Date(expense.date)
        };

        initialMembers.forEach(member => {
          member.included = expense.shares.some(s => s.id === member.id);
        });

        const controls = expense.shares.map(share =>
          new FormGroup<ShareForm>({
            id: new FormControl<string>(share.id),
            share: new FormControl<number>(share.share),
            amount: new FormControl<number>(share.amount),
            fixed: new FormControl<boolean>(share.fixed),
          })
        );

        this.expenseForm.patchValue(clonedExpense);
        this.expenseForm.setControl('shares', new FormArray(controls));
      }
    }

    this.members.set(initialMembers);
  }

  toggleMember(id: string): void {
    this.members.update(list =>
      list.map(m => m.id === id ? { ...m, included: !m.included } : m)
    );
    this.setShares();
  }

  setMemberIncluded(id: string, included: boolean): void {
    this.members.update(list =>
      list.map(m => m.id === id ? { ...m, included } : m)
    );
    this.setShares();
  }

  selectAll = (): void => {
    this.members.update(list => list.map(m => ({ ...m, included: true })));
    this.setShares();
  };


  addExpense = (): void => {
    const form = this.expenseForm.getRawValue() as Expense;
    const id = form.id;
    const gid = this.groupId();
    if (id) {
      this.apiService.updateExpense(form, gid);
    } else {
      this.apiService.addExpense(form, gid);
    }
    this.router.navigate(['/dashboard', gid]);
  };

  setShares(): void {
    const form = this.expenseForm.getRawValue();
    const amount = form.amount || 0;
    const included = this.members().filter(x => x.included);

    if (included.length === 0) {
      this.expenseForm.setControl('shares', new FormArray<FormGroup<ShareForm>>([]));
      return;
    }

    const controls = included.map(member =>
      new FormGroup<ShareForm>({
        id: new FormControl<string>(member.id),
        share: new FormControl<number>(100 / included.length),
        amount: new FormControl<number>(amount / included.length),
        fixed: new FormControl<boolean>(false),
      })
    );

    const newArray = new FormArray<FormGroup<ShareForm>>(controls);
    this.expenseForm.setControl('shares', newArray);
  }


  updateShares(index: number): void {
    const amount = this.expenseForm.getRawValue().amount ?? 0;
    const controls = this.shares.controls;

    const fixedControls = controls.filter(c => c.get('fixed')!.value);
    const fixedTotal = fixedControls.reduce((sum, c) => sum + (c.get('share')!.value ?? 0), 0);

    const current = controls[index];

    let currentShare = current.get('share')!.value ?? 0;
    const maxAllowed = 100 - fixedTotal;

    if (currentShare > maxAllowed) {
      currentShare = maxAllowed;
      current.get('share')!.setValue(currentShare, { emitEvent: false });
    }

    current.get('amount')!.setValue((currentShare / 100) * amount, { emitEvent: false });

    const editable = controls.filter((c, i) => i !== index && !c.get('fixed')!.value);
    if (editable.length === 0) return;

    const remaining = 100 - fixedTotal - currentShare;
    const perShare = remaining / editable.length;

    editable.forEach(c => {
      c.get('share')!.setValue(perShare, { emitEvent: false });
      c.get('amount')!.setValue((perShare / 100) * amount, { emitEvent: false });
    });
  }

  updateAmounts = () => {
    const amount = this.expenseForm.getRawValue().amount || 0
    this.shares.controls.forEach(x => {
      const share = x.get('share')!.value || 0
      x.get('amount')!.setValue(amount * share / 100)
    })
  }

  isFixedCheckboxDisabled(index: number): boolean {
    const control = this.shares.at(index);
    const isFixed = control.get('fixed')!.value;
    if (isFixed) return false;
    const unfixedCount = this.shares.controls.filter(c => !c.get('fixed')!.value).length;
    return unfixedCount <= 2;
  }

}
