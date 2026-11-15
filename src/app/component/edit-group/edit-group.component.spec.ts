import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Group, GROUP_THUMBNAILS } from '../../interface/interface';
import { ApiService } from '../../service/api.service';
import { EditGroupComponent } from './edit-group.component';

describe('EditGroupComponent', () => {
  const group: Group = { id: 'group', name: 'Trip', thumbnail: '', members: [], expenses: [] };
  const api = { updateGroupDetails: vi.fn() };
  const messages = { add: vi.fn() };
  let fixture: ComponentFixture<EditGroupComponent>;
  let component: EditGroupComponent;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({ imports: [EditGroupComponent], providers: [
      { provide: ApiService, useValue: api }, { provide: MessageService, useValue: messages }
    ] }).overrideComponent(EditGroupComponent, { set: { template: '', imports: [] } }).compileComponents();
    fixture = TestBed.createComponent(EditGroupComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('group', group);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
  });

  it('initializes the form when opened and supplies a fallback thumbnail', () => {
    expect(component.editForm.getRawValue()).toEqual({ name: 'Trip', thumbnail: GROUP_THUMBNAILS[0] });
  });

  it('rejects whitespace-only names and marks fields as touched', () => {
    component.editForm.controls.name.setValue('   ');
    component.save();
    expect(api.updateGroupDetails).not.toHaveBeenCalled();
    expect(component.editForm.controls.name.touched).toBe(true);
    expect(component.visible()).toBe(true);
  });

  it('saves trimmed details, reports success and closes the dialog', () => {
    component.editForm.controls.name.setValue(' Updated trip ');
    component.selectThumbnail(GROUP_THUMBNAILS[1]);
    expect(component.editForm.controls.thumbnail.dirty).toBe(true);
    component.save();
    expect(api.updateGroupDetails).toHaveBeenCalledWith('group', 'Updated trip', GROUP_THUMBNAILS[1]);
    expect(messages.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    expect(component.visible()).toBe(false);
  });

  it('does not save without a group and cancels without mutation', () => {
    fixture.componentRef.setInput('group', null);
    component.save();
    component.cancel();
    expect(api.updateGroupDetails).not.toHaveBeenCalled();
    expect(component.visible()).toBe(false);
  });
});