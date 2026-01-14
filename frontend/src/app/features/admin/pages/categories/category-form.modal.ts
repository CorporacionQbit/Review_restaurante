import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { CategoriesService, Category } from './categories.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzInputModule],
  templateUrl: './category-form.modal.html',
   styleUrls: ['./category-form.modal.css'],
   encapsulation: ViewEncapsulation.None,
})
export class CategoryFormModalComponent implements OnInit {

  @Input() category?: Category;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private categoriesService: CategoriesService,
    private message: NzMessageService,
    private modalRef: NzModalRef
  ) {}

  ngOnInit(): void {
    // ✅ SIEMPRE crear el form primero
    this.form = this.fb.group({
      name: ['', Validators.required],
    });

    // ✅ luego patch si es edición
    if (this.category) {
      this.form.patchValue({
        name: this.category.name,
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.message.warning('El nombre es obligatorio');
      return;
    }

    const payload = {
      name: this.form.value.name as string,
    };

    const request$ = this.category
      ? this.categoriesService.update(this.category.categoryId, payload)
      : this.categoriesService.create(payload);

    request$.subscribe({
      next: () => {
        this.message.success('Categoría guardada');
        this.modalRef.close(true); // ✅ CIERRA MODAL
      },
      error: () => {
        this.message.error('Error al guardar');
      },
    });
  }
}
