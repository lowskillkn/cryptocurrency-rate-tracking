<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
        >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
              @keydown.enter="add"
              v-model="ticker"
              type="text"
              name="wallet"
              id="wallet"
              class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
              placeholder="Например DOGE"
          />
        </div>

      </div>
    </div>
    <add-button @click="add" :addBlocker="addBlocker"/>
  </section>
</template>

<script>
import AddButton from "./AddButton";

export default {
  data() {
    return {
      ticker: '',
      addBlocker: true
    }
  },

  components: {
    AddButton
  },

  props: {
    tickers: {
      type: Array,
      required: true,
    },
    disabled: {
      type: Boolean,
      required: true
    }
  },

  emits: {
    'add-ticker': value => (typeof value) === 'string' && value.length > 0
  },

  methods: {
    add() {
      if (this.addBlocker) {
        return
      }
      this.$emit('add-ticker', this.ticker)
      this.ticker = ''
    },

    checkInputData() {
      if (this.disabled) {
        this.addBlocker = true
        return
      }
      const check = this.tickers.filter(e => e.name === this.ticker.toUpperCase()).length
      if (check || this.ticker.length === 0) {
        this.addBlocker = true
      } else {
        this.addBlocker = false
      }
    }
  },

  watch: {
    ticker() {
      this.checkInputData()
    },

    tickers() {
      this.checkInputData()
    }
  },

}
</script>