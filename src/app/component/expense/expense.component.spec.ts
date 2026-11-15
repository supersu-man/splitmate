import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Expense, Group } from '../../interface/interface';
import { ApiService } from '../../service/api.service';
import { ExpenseComponent } from './expense.component';

describe('ExpenseComponent', () => {
  const group: Group = {
    id: 'group', name: 'Trip', thumbnail: 'thumbnail_1.jpg', expenses: [],
    members: [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }, { id: 'carol', name: 'Carol' }]
  };
  const api = {
    groups: signal<Group[]>([group]), getGroup: vi.fn(() => group),
    getExpense: vi.fn<(groupId: string, expenseId: string) => Expense | undefined>(),
    addExpense: vi.fn(), updateExpense: vi.fn()
  };
  const router = { navigate: vi.fn() };
  let fixture: ComponentFixture<ExpenseComponent>;
  let component: ExpenseComponent;

  beforeEach(async () => {
    vi.clearAllMocks();
    api.groups.set([group]);
    api.getExpense.mockReturnValue(undefined);
    await TestBed.configureTestingModule({ imports: [ExpenseComponent], providers: [
      { provide: ApiService, useValue: api }, { provide: Router, useValue: router }
    ] }).overrideComponent(ExpenseComponent, { set: { template: '', imports: [] } }).compileComponents();
    fixture = TestBed.createComponent(ExpenseComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('groupId', 'group');
  });

  it('initializes excluded members and validates the minimum expense amount', () => {
    fixture.detectChanges();
    expect(component.members().every(member => !member.included)).toBe(true);
    expect(component.atleastOneMemberIncluded()).toBe(false);
    expect(component.memberNameMap().get('alice')).toBe('Alice');
    component.expenseForm.controls.amount.setValue(0);
    expect(component.expenseForm.controls.amount.invalid).toBe(true);
    component.expenseForm.controls.amount.setValue(0.01);
    expect(component.expenseForm.controls.amount.valid).toBe(true);
  });

  it('splits equally among included members and clears deselected shares', () => {
    fixture.detectChanges();
    component.expenseForm.controls.amount.setValue(90);
    component.selectAll();
    expect(component.shares.getRawValue().map(share => share.amount)).toEqual([30, 30, 30]);
    component.toggleMember('carol');
    expect(component.shares.getRawValue().map(share => share.amount)).toEqual([45, 45]);
    component.setMemberIncluded('alice', false);
    component.setMemberIncluded('bob', false);
    expect(component.shares.length).toBe(0);
    expect(component.atleastOneMemberIncluded()).toBe(false);
  });

  it('redistributes shares while respecting fixed shares and updates amounts', () => {
    fixture.detectChanges();
    component.expenseForm.controls.amount.setValue(100);
    component.selectAll();
    component.shares.at(0).patchValue({ share: 20, amount: 20, fixed: true });
    component.shares.at(1).controls.share.setValue(90);
    component.updateShares(1);
    expect(component.shares.getRawValue().map(share => share.share)).toEqual([20, 80, 0]);
    component.expenseForm.controls.amount.setValue(200);
    component.updateAmounts();
    expect(component.shares.getRawValue().map(share => share.amount)).toEqual([40, 160, 0]);
    expect(component.isFixedCheckboxDisabled(0)).toBe(false);
    expect(component.isFixedCheckboxDisabled(1)).toBe(true);
  });

  it('adds a new expense and navigates back to the group', () => {
    fixture.detectChanges();
    component.expenseForm.patchValue({ amount: 30, description: 'Lunch', paidBy: 'alice' });
    component.selectAll();
    component.addExpense();
    expect(api.addExpense).toHaveBeenCalledWith(component.expenseForm.getRawValue(), 'group');
    expect(api.updateExpense).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard', 'group']);
  });

  it('loads an existing expense, restores shares and updates instead of adding', () => {
    const expense: Expense = {
      id: 'expense', amount: 30, description: 'Lunch', paidBy: 'alice', date: new Date('2026-01-01'),
      shares: [{ id: 'bob', share: 100, amount: 30, fixed: false }]
    };
    api.getExpense.mockReturnValue(expense);
    fixture.componentRef.setInput('expenseId', 'expense');
    fixture.detectChanges();
    expect(component.expenseForm.controls.date.value).toEqual(expense.date);
    expect(component.members().filter(member => member.included).map(member => member.id)).toEqual(['bob']);
    expect(component.shares.getRawValue()).toEqual(expense.shares);
    component.addExpense();
    expect(api.updateExpense).toHaveBeenCalledWith(expense, 'group');
    expect(api.addExpense).not.toHaveBeenCalled();
  });
});