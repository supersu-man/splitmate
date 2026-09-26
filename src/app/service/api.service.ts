import { computed, effect, Injectable, signal } from '@angular/core';
import { Expense, Group, Member, Settlement } from '../interface/interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly STORAGE_KEY = 'groups';

  // Core reactive state for all groups
  private readonly _groups = signal<Group[]>(this.loadInitialGroups());

  // Public readonly signal for groups
  readonly groups = this._groups.asReadonly();

  // Computed total group count
  readonly groupCount = computed(() => this._groups().length);

  constructor() {
    // Automatically persist to localStorage whenever groups state changes
    effect(() => {
      const current = this._groups();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(current));
    });
  }

  private loadInitialGroups(): Group[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Returns current snapshot of groups
   */
  getGroups(): Group[] {
    return this._groups();
  }

  /**
   * Reactive signal factory for a specific group by ID
   */
  getGroupSignal(id: string) {
    return computed(() => this._groups().find(group => group.id === id));
  }

  /**
   * Reactive signal factory for settlements of a group
   */
  getSettlementsSignal(id: string) {
    return computed(() => {
      const group = this._groups().find(g => g.id === id);
      if (!group) return [];
      return this.computeSettlements(group);
    });
  }

  /**
   * Synchronous getter for backward compatibility or single-shot reads
   */
  getGroup(id: string): Group | undefined {
    return this._groups().find(group => group.id === id);
  }

  createGroup(payload: Group): string {
    const id = uuidv4();
    const members = payload.members.map((member: Member) => ({
      ...member,
      id: member.id || uuidv4()
    }));
    const newGroup: Group = {
      ...payload,
      id,
      members,
      expenses: payload.expenses || []
    };

    this._groups.update(groups => [...groups, newGroup]);
    return id;
  }

  updateGroupName(id: string, name: string): void {
    this._groups.update(groups =>
      groups.map(group =>
        group.id === id ? { ...group, name } : group
      )
    );
  }

  deleteGroup(id: string): void {
    this._groups.update(groups => groups.filter(group => group.id !== id));
  }

  updateMemberName(memberName: string, groupId: string, memberId: string): void {
    this._groups.update(groups =>
      groups.map(group => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          members: group.members.map(member =>
            member.id === memberId ? { ...member, name: memberName } : member
          )
        };
      })
    );
  }

  addExpense(expense: Expense, groupId: string): void {
    const newExpense: Expense = {
      ...expense,
      id: uuidv4()
    };

    this._groups.update(groups =>
      groups.map(group => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          expenses: [...group.expenses, newExpense]
        };
      })
    );
  }

  getExpense(groupId: string, expenseId: string): Expense | undefined {
    const group = this.getGroup(groupId);
    return group?.expenses.find(expense => expense.id === expenseId);
  }

  updateExpense(expense: Expense, groupId: string): void {
    this._groups.update(groups =>
      groups.map(group => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          expenses: group.expenses.map(e => (e.id === expense.id ? expense : e))
        };
      })
    );
  }

  deleteExpense(id: string, groupId: string): void {
    this._groups.update(groups =>
      groups.map(group => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          expenses: group.expenses.filter(e => e.id !== id)
        };
      })
    );
  }

  /**
   * Pure settlement computation with precision rounding and minimum cash-flow greedy algorithm.
   */
  computeSettlements(group: Group): Settlement[] {
    if (!group.members?.length || !group.expenses?.length) {
      return [];
    }

    const balances = new Map<string, number>();
    group.members.forEach(member => {
      balances.set(member.id, 0);
    });

    group.expenses.forEach(expense => {
      const payerId = expense.paidBy;
      const currentPayerBalance = balances.get(payerId) ?? 0;
      balances.set(payerId, currentPayerBalance + expense.amount);

      expense.shares.forEach(share => {
        const currentShareBalance = balances.get(share.id) ?? 0;
        balances.set(share.id, currentShareBalance - share.amount);
      });
    });

    const creditors: { id: string; amount: number }[] = [];
    const debtors: { id: string; amount: number }[] = [];

    balances.forEach((balance, id) => {
      const rounded = Math.round(balance * 100) / 100;
      if (rounded > 0.009) {
        creditors.push({ id, amount: rounded });
      } else if (rounded < -0.009) {
        debtors.push({ id, amount: -rounded });
      }
    });

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const finalSettlements: Settlement[] = [];
    let i = 0;
    let j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];
      const settlementAmount = Math.round(Math.min(creditor.amount, debtor.amount) * 100) / 100;

      if (settlementAmount > 0) {
        finalSettlements.push({
          from: debtor.id,
          to: creditor.id,
          amount: settlementAmount
        });
      }

      creditor.amount = Math.round((creditor.amount - settlementAmount) * 100) / 100;
      debtor.amount = Math.round((debtor.amount - settlementAmount) * 100) / 100;

      if (creditor.amount <= 0.009) i++;
      if (debtor.amount <= 0.009) j++;
    }

    return finalSettlements;
  }

  // Alias getSettlements for compatibility
  getSettlements(group: Group): Settlement[] {
    return this.computeSettlements(group);
  }
}

