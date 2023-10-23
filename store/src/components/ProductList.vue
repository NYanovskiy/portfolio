<template>
  <ul class="catalog__list">
<ProductItem v-for="(product) in products" :product="product" :key="product.id"
@gotoPage="(pageName, pageParams) => $emit('gotoPage', pageName, pageParams)"></ProductItem>
  </ul>
</template>

<script>

import ProductItem from './ProductItem.vue';

export default {
  props: ['products'],
  components: {
    ProductItem,
  },
};
</script>
