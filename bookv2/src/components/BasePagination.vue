<template>
  <ul class="catalog__pagination pagination">
    <li class="pagination__item">
      <a class="pagination__link pagination__link--arrow"
       :class="{ 'pagination__link--disabled': page <= 1 }"
        @click.prevent.stop="PrePaginate(page)" aria-label="Предыдущая страница">
        <svg width="8" height="14" fill="currentColor">
          <use xlink:href="#icon-arrow-left"></use>
        </svg>
      </a>
    </li>
    <li class="pagination__item" v-for="pageNumder in pages" :key="pageNumder">
      <a href="#" class="pagination__link" @click.prevent.stop="paginate(pageNumder)"
        :class="{ 'pagination__link--arrow': pageNumder === page }">
        {{ pageNumder }}
      </a>
    </li>
    <li class="pagination__item">
      <a class="pagination__link pagination__link--arrow" href="#"
        :class="{ 'pagination__link--disabled ': pages === page }"
        @click.prevent.stop="NextPaginate(page)"
        aria-label="Следующая страница">
        <svg width="8" height="14" fill="currentColor">
          <use xlink:href="#icon-arrow-right"></use>
        </svg>
      </a>
    </li>
  </ul>
</template>

<script>
export default {
  model: {
    prop: 'page',
    event: 'paginate',
  },
  props: ['page', 'count', 'perPage'],
  computed: {
    pages() {
      return Math.ceil(this.count / this.perPage);
    },
  },
  methods: {
    paginate(page) {
      this.$emit('paginate', page);
    },
    NextPaginate(page) {
      if (page < this.pages) {
        const newPage = page + 1;
        this.$emit('paginate', newPage);
      }
    },
    PrePaginate(page) {
      if (page > 1) {
        const newPage = page - 1;
        this.$emit('paginate', newPage);
      }
    },
  },
};
</script>
