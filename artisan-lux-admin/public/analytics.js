(function(){
  try{
    var sid=localStorage.getItem("alx_sid");
    if(!sid){ sid=(Math.random().toString(36).slice(2)+Date.now().toString(36)); localStorage.setItem("alx_sid", sid); }
    var payload={ path: location.pathname, referrer: document.referrer || null, sessionId: sid };
    var url="/api/analytics/pv";
    if(navigator.sendBeacon){
      var blob=new Blob([JSON.stringify(payload)],{type:"application/json"});
      navigator.sendBeacon(url, blob);
    }else{
      fetch(url,{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload)}).catch(function(){});
    }
  }catch(e){}
})();
