import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

import { CategoriesService, Category } from './categories.service';
import { CategoryFormModalComponent } from './category-form.modal';

@Component({
  standalone: true,
  imports: [CommonModule, NzTableModule, NzButtonModule, NzModalModule],
  templateUrl: './categories.component.html',
   styleUrls: ['./categories.component.css'],
   encapsulation: ViewEncapsulation.None,
})
export class CategoriesPageComponent implements OnInit {
  categories: Category[] = [];
  loading = false;

  constructor(
    private categoriesService: CategoriesService,
    private modal: NzModalService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.categoriesService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: () => {
        this.message.error('Error cargando categorías');
        this.loading = false;
      },
    });
  }

  create() {
    const ref = this.modal.create({
      nzTitle: 'Nueva categoría',
      nzContent: CategoryFormModalComponent,
      nzFooter: null,
    });

    ref.afterClose.subscribe((ok) => ok && this.loadCategories());
  }

  edit(category: Category) {
    const ref = this.modal.create({
      nzTitle: 'Editar categoría',
      nzContent: CategoryFormModalComponent,
      nzData: category,
      nzFooter: null,
    });

    ref.afterClose.subscribe((ok) => ok && this.loadCategories());
  }
  
  delete(category: Category) {
    this.modal.confirm({
      nzTitle: '¿Eliminar categoría?',
      nzContent: category.name,
      nzOkDanger: true,
      nzOnOk: () =>
        this.categoriesService.delete(category.categoryId).subscribe(() => {
          this.message.success('Categoría eliminada');
          this.loadCategories();
        }),
    });
  }
}
