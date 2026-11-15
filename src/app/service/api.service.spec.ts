import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Expense, Group } from '../interface/interface';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  const group: Group = {
    id: 'group', name: 'Trip', thumbnail: 'thumbnail_1.jpg',
    members: [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }],
    expenses: []
  };
  const expense: Expense = {
    id: 'expense', amount: 30, description: 'Lunch', paidBy: 'alice', date: new Date('2026-01-01'),
    shares: [
      { id: 'alice', amount: 15, share: 50, fixed: false },
      { id: 'bob', amount: 15, share: 50, fixed: false }
    ]
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  it('starts with no groups', () => {
    expect(service.getGroups()).toEqual([]);
    expect(service.groupCount()).toBe(0);
  });

  it('loads stored groups', () => {
    TestBed.resetTestingModule();
    localStorage.setItem('groups', JSON.stringify([group]));
    service = TestBed.inject(ApiService);
    expect(service.getGroup('group')).toEqual(group);
  });

  it('recovers from malformed stored JSON', () => {
    TestBed.resetTestingModule();
    localStorage.setItem('groups', '{invalid');
    service = TestBed.inject(ApiService);
    expect(service.groups()).toEqual([]);
  });

  it('assigns group and missing member IDs and persists changes', () => {
    const id = service.createGroup({ ...group, members: [{ id: '', name: 'Alice' }, group.members[1]] });
    TestBed.tick();
    expect(id).not.toBe(group.id);
    expect(service.getGroup(id)?.members[0].id).toBeTruthy();
    expect(service.getGroup(id)?.members[1].id).toBe('bob');
    expect(service.groupCount()).toBe(1);
    expect(JSON.parse(localStorage.getItem('groups')!)).toEqual(service.groups());
  });

  it('duplicates a group with new IDs and remapped expense members', () => {
    const sourceId = service.createGroup({ ...group, expenses: [expense] });
    const duplicateId = service.duplicateGroup(sourceId)!;
    const duplicate = service.getGroup(duplicateId)!;

    expect(duplicate.id).not.toBe(sourceId);
    expect(duplicate.name).toBe('Trip (Copy)');
    expect(duplicate.thumbnail).toBe(group.thumbnail);
    expect(duplicate.members.map(member => member.name)).toEqual(['Alice', 'Bob']);
    expect(duplicate.members[0].id).not.toBe('alice');
    expect(duplicate.members[1].id).not.toBe('bob');
    expect(duplicate.expenses).toHaveLength(1);
    expect(duplicate.expenses[0]).toMatchObject({
      amount: 30,
      description: 'Lunch',
      paidBy: duplicate.members[0].id,
      shares: [
        { id: duplicate.members[0].id, amount: 15, share: 50, fixed: false },
        { id: duplicate.members[1].id, amount: 15, share: 50, fixed: false }
      ]
    });
    expect(duplicate.expenses[0].id).not.toBe('expense');
    expect(service.getGroup(sourceId)?.members[0].id).toBe('alice');
  });

  it('updates group and member details and invalidates group signals', () => {
    const id = service.createGroup(group);
    const selected = service.getGroupSignal(id);
    expect(selected()?.name).toBe('Trip');
    service.updateGroupDetails(id, ' New trip ', 'thumbnail_2.jpg');
    service.updateMemberName('Robert', id, 'bob');
    expect(selected()?.name).toBe('New trip');
    expect(selected()?.thumbnail).toBe('thumbnail_2.jpg');
    expect(selected()?.members[1].name).toBe('Robert');
    service.deleteGroup(id);
    expect(selected()).toBeUndefined();
    expect(service.groupCount()).toBe(0);
  });

  it('adds, updates and deletes expenses without changing another group', () => {
    const id = service.createGroup(group);
    const otherId = service.createGroup(group);
    service.addExpense(expense, id);
    const created = service.getGroup(id)!.expenses[0];
    expect(created.id).not.toBe(expense.id);
    expect(service.getExpense(id, created.id)?.amount).toBe(30);
    service.updateExpense({ ...created, description: 'Dinner' }, id);
    expect(service.getExpense(id, created.id)?.description).toBe('Dinner');
    expect(service.getGroup(otherId)?.expenses).toEqual([]);
    service.deleteExpense(created.id, id);
    expect(service.getExpense(id, created.id)).toBeUndefined();
    expect(service.getExpense('missing', created.id)).toBeUndefined();
  });

  it('computes debtor-to-creditor settlements and updates settlement signals', () => {
    const id = service.createGroup(group);
    const settlements = service.getSettlementsSignal(id);
    expect(settlements()).toEqual([]);
    service.addExpense(expense, id);
    expect(settlements()).toEqual([{ from: 'bob', to: 'alice', amount: 15 }]);
    expect(service.getSettlements(service.getGroup(id)!)).toEqual(settlements());
    expect(service.getSettlementsSignal('missing')()).toEqual([]);
  });

  it('rounds settlements to cents and ignores balanced expenses', () => {
    expect(service.computeSettlements({ ...group, expenses: [{
      ...expense, amount: 10,
      shares: [
        { id: 'alice', amount: 3.333, share: 33.33, fixed: false },
        { id: 'bob', amount: 6.667, share: 66.67, fixed: false }
      ]
    }] })).toEqual([{ from: 'bob', to: 'alice', amount: 6.67 }]);
    expect(service.computeSettlements({ ...group, expenses: [expense, { ...expense, paidBy: 'bob' }] })).toEqual([]);
    expect(service.computeSettlements(group)).toEqual([]);
    expect(service.computeSettlements({ ...group, members: [], expenses: [expense] })).toEqual([]);
  });
});