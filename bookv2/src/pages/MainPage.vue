<template>
  <main class="content container">
    <div class="content__top content__top--catalog">
      <h1 class="content__title">
        Каталог
      </h1>
      <span class="content__info">
        152 товара
      </span>
    </div>

    <div class="content__catalog">
      <ProductFilter :price-from.sync="filterPriceFrom" :price-to.sync="filterPriceTo" :category.sync="filterCategoryId" :color.sync="filterColorId"></ProductFilter>

      <section class="catalog">
        <ProductList :products="productsCount"
        @gotoPage="(pageName, pageParams) => $emit('gotoPage', pageName, pageParams)"></ProductList>

        <BasePagination v-model="page" :count="countProducts" :per-page="productsPrePage">
        </BasePagination>
      </section>
    </div>
  </main>
</template>

<script>
import products from '@/data/products';
import ProductList from '@/components/ProductList.vue';
import BasePagination from '@/components/BasePagination.vue';
import ProductFilter from '@/components/ProductFilter.vue';

export default {
  components: {
    ProductList,
    BasePagination,
    ProductFilter,
  },
  data() {
    return {
      filterPriceFrom: 0,
      filterPriceTo: 0,
      filterCategoryId: 0,
      filterColorId: 0,
      page: 1,
      productsPrePage: 6,
    };
  },
  computed: {
    filteredProducts() {
      let filterProducts = products;

      if(this.filterPriceFrom > 0) {
        filterProducts = filterProducts.filter(product => product.price > this.filterPriceFrom);
      }

      if(this.filterPriceTo > 0) {
        filterProducts = filterProducts.filter(product => product.price < this.filterPriceTo);
      }

      if(this.filterCategoryId) {
        filterProducts = filterProducts.filter(product => product.categoryId === this.filterCategoryId);
      }

      if(this.filterColorId) {
        filterProducts = filterProducts.filter(product => product.colorId === this.filterColorId);
      }

      return filterProducts;
    },
    productsCount() {
      const offset = (this.page - 1) * this.productsPrePage;
      return this.filteredProducts.slice(offset, offset + this.productsPrePage);
    },
    countProducts() {
      return this.filteredProducts.length;
    },
  },
};
</script>
