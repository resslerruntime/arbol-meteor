const createWIT = new Vue({
  el:'#createWIT',
  components: {
  	vuejsDatepicker
  },
  data() {
    return {
      step:1,
      newwit:{
        weatherindex:'Rainfall',
        locationtype:null,
        startdate:null,
        enddate:null,
        threshold_relation:'greater',
        threshold_percent:'10',
        threshold_average:'above',
        contribution:'0.001',
        payout:'0.001'
      }
    }
  },
  methods: {
    capVal(event) {
      let contribution = parseFloat(event.target.value);
      let payout = parseFloat(this.newwit.payout);
      let element = event.currentTarget;
      let step = parseFloat(element.getAttribute('step').trim());
      if(contribution >= payout) {
        this.newwit.payout = contribution + step;
      }
    },
    prev() {
      this.step--;
    },
    next() {
      this.step++;
    },
    cancel() {
      this.step = 1;
    },
    submit() {
      alert('Submit to blah and show blah and etc.');
    }
  }
});

Vue.filter('formatDate', function(value,dateformatas) {
  if (value && dateformatas) {
    var d = new Date(value);
    return d.toLocaleDateString('en-US', dateformatas);
  }
});