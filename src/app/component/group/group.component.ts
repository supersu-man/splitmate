import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { ButtonModule } from 'primeng/button';
import { DecimalPipe } from '@angular/common';
import { UtilService } from 'src/app/service/util.service';
import { DialogModule } from 'primeng/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-group',
  imports: [RouterLink, ButtonModule, DecimalPipe, DialogModule, InputTextModule, ReactiveFormsModule],
  templateUrl: './group.component.html',
  styles: ``
})
export class GroupComponent {

  private readonly apiService = inject(ApiService);
  private readonly utilService = inject(UtilService);

  // Router component input binding for :groupId
  readonly groupId = input.required<string>();

  // Reactive group derived from groups signal
  readonly group = computed(() => {
    const id = this.groupId();
    return this.apiService.groups().find(g => g.id === id);
  });

  // Reactive member map derived from group members
  readonly memberMap = computed<Record<string, string>>(() => {
    const g = this.group();
    if (!g) return {};
    const map: Record<string, string> = {};
    for (const member of g.members) {
      map[member.id] = member.name;
    }
    return map;
  });

  // Reactive settlements automatically recomputed when group or expenses change
  readonly settlements = computed(() => {
    const g = this.group();
    if (!g) return [];
    const rawSettlements = this.apiService.computeSettlements(g);
    const map = this.memberMap();
    return rawSettlements.map(item => ({
      from: map[item.from] || item.from,
      to: map[item.to] || item.to,
      amount: item.amount
    }));
  });

  deleteExpenseId = signal<string>('');
  memberDialog = signal<boolean>(false);

  readonly memberForm = new FormGroup({
    id: new FormControl<string | null>(null, Validators.required),
    name: new FormControl<string | null>(null, Validators.required)
  });

  openEditMember(id: string, name: string): void {
    this.memberForm.patchValue({ id, name });
    this.memberDialog.set(true);
  }

  deleteExpenseConfirmPopup(event: Event, expenseId: string): void {
    this.deleteExpenseId.set(expenseId);
    this.utilService.confirmDialog(
      event,
      "Delete expense?",
      "Are you sure you want to delete the expense?",
      this.deleteExpense
    );
  }

  saveMember(): void {
    if (this.memberForm.invalid) return;
    const form = this.memberForm.getRawValue();
    this.apiService.updateMemberName(form.name || '', this.groupId(), form.id || '');
    this.memberDialog.set(false);
  }

  private deleteExpense = (): void => {
    const expId = this.deleteExpenseId();
    if (expId) {
      this.apiService.deleteExpense(expId, this.groupId());
    }
  };
}

