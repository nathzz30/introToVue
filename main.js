Vue.component('product', {
  props: {
    premium: {
      type: Boolean,
      required: true
    },
    cart: {
      type: Array,
      required: true
    }
  },
  template: `
  <div class="product">

    <div class="product-image">
        <img :src="image" :alt="altText" />
    </div>

    <div class="product-info">
        <h1>{{ title }}</h1>
        <p v-if="inventory > 10">In Stock</p>
        <p v-else-if="inventory <= 10 && inventory > 0">Almost sold out!</p>
        <p v-else>Out Of Stock</p>

        <div class="color-box"
            v-for="(variant, index) in variants" 
            :key="variant.variantId"
            :style="{ backgroundColor: variant.variantColor }"
            @mouseover="updateProduct(index)"
            >
        </div>

        <div>
          <p>Inventory: {{ inventory }}</p>
        </div>

        <p>Shipping: {{ shipping }}</p>

        <button v-on:click="addToCart"
                :disabled="!inventory"
                :class="{ disabledButton: !inventory }"
        >
        Add To Cart
        </button>
        
        <button v-on:click="removeFromCart"
                :disabled="!cart.length"
                :class="{ disabledButton: !cart.length }"
        >
        Remove From Cart
        </button>

        <product-tabs :reviews="reviews" :details="details"></product-tabs>
        
    </div>
  </div>
  `,
  data() {
    return {
      product: 'Socks',
      altText: "A pair of socks",
      brand: 'Vue Mastery',
      selectedVariant: 0,
      details: ["80% cotton", "20% polyester", "Gender-neutral"],
      variants: [
        {
          variantId: 2234,
          variantColor: "green",
          variantImage: "./assets/vmSocks-green-onWhite.jpg",
          variantQuantity: 11,
        },
        {
          variantId: 2235,
          variantColor: "blue",
          variantImage: "./assets/vmSocks-blue-onWhite.jpg",
          variantQuantity: 0,
        }
      ],
      reviews: []
    }
  },
  methods: {
    addToCart() {
      this.$emit('add-to-cart', 'add', this.variants[this.selectedVariant]);
    },
    removeFromCart() {
      this.$emit('remove-from-cart', 'remove', this.variants[this.selectedVariant]);
    },
    updateProduct(index) {
      this.selectedVariant = index;
    }
  },
  computed: {
    title() {
      return this.brand + ' ' + this.product;
    },
    image() {
      return this.variants[this.selectedVariant].variantImage;
    },
    inventory() {
      return this.variants[this.selectedVariant].variantQuantity;
    },
    shipping() {
      return this.premium ? "Free" : 2.99; 
    }
  },
  mounted() {
    eventBus.$on('review-submitted', function(productReview) {
      this.reviews.push(productReview);
    }.bind(this));
  }
})

Vue.component('product-review', {
  template: `
    <form class="review-form" @submit.prevent="onSubmit">

      <p class="error" v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
          <li v-for="error in errors">{{ error }}</li>
        </ul>
      </p>
      <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name" placeholder="name">
      </p>
      
      <p>
        <label for="review">Review:</label>      
        <textarea id="review" v-model="review"></textarea>
      </p>
      
      <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>

      <p>
        <label for="recommended">Will you recommend?</label>
        <input type="radio" v-model="recommended" value="yes">yes
        <input type="radio" v-model="recommended" value="no">no
      </p>
          
      <p>
        <input type="submit" value="Submit">  
      </p>    
    
    </form>
  `,
  data() {
    return {
      name: null,
      review: null,
      rating: null,
      recommended: null,
      errors: []
    }
  },
  methods: {
    onSubmit() {
      this.errors = [];
      if(this.name && this.review && this.rating && this.recommended) {
        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating,
          recommended: this.recommended
        }
        eventBus.$emit('review-submitted', productReview)
        this.name = null
        this.review = null
        this.rating = null
        this.recommended = null
      } else {
        if(!this.name) this.errors.push("Name required.")
        if(!this.review) this.errors.push("Review required.")
        if(!this.rating) this.errors.push("Rating required.")
        if(!this.recommended) this.errors.push("Recommended required.")
      }
      
    }
  }
});

Vue.component('product-tabs', {
  props: {
    reviews: {
      type: Array,
      required: false
    },
    details: {
      type: Array,
      required: true
    }
  },
  template: `
    <div>
      <ul>
        <span class="tabs" 
              v-for="(tab, index) in tabs" 
              :key="index"
              :class="{ activeTab: selectedTab === tab }"
              @click="selectedTab = tab"
        >{{ tab }}</span>
      </ul>

      <div v-show="selectedTab === 'Details'">
        <ul>
          <li v-for="detail in details">{{ detail }}</li>
        </ul>
      </div>

      <div v-show="selectedTab === 'Reviews'">
          <p v-if="!reviews.length">There are no reviews yet.</p>
          <ul>
            <li v-for="(review, index) in reviews" :key="index">
              <p>{{ review.name }}</p>
              <p>Rating: {{ review.rating }}</p>
              <p>{{ review.review }}</p>
              <p>Will recommended? {{ review.recommended }}</p>
            </li>
          </ul>
      </div>

      <div v-show="selectedTab === 'Make a Review'">
        <product-review></product-review>  
      </div>

    </div>
  `,
  data() {
    return {
      tabs:['Details', 'Reviews', 'Make a Review'],
      selectedTab: 'Reviews'
    }
  }
});

var eventBus = new Vue()

var app = new Vue({
  el: '#app',
  data: {
    premium: true,
    cart: []
  },
  methods: {
    updateCart(action, product) {
      if(action === 'add'){
        if(product.variantQuantity > 0) {
          product.variantQuantity -= 1;
          this.cart.push(product);
        }
      } else {
        if(this.cart.length > 0) {
          product.variantQuantity += 1;
          this.cart.pop();
        } 
      }
    },
    removeFromCart(products, product) {

    }
  }
})