// Serverless proxy for live USD-based rates. Uses ExchangeRate-API's open endpoint (no API key, attribution required).
const json=(code,body,extra)=>({statusCode:code,headers:Object.assign({'Content-Type':'application/json'},extra||{}),body:JSON.stringify(body)});
exports.handler=async()=>{
  const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),8000);
  try{
    const r=await fetch('https://open.er-api.com/v6/latest/USD',{signal:ctl.signal});
    if(!r.ok)return json(502,{error:'upstream '+r.status});
    const d=await r.json();
    if(d.result!=='success'||!d.rates||d.rates.USD!==1)return json(502,{error:'unexpected payload'});
    return json(200,{result:'success',provider:'open.er-api.com',time_last_update_utc:d.time_last_update_utc,time_last_update_unix:d.time_last_update_unix,rates:d.rates},{'Cache-Control':'public, max-age=900'});
  }catch(e){return json(502,{error:'fetch failed'})}finally{clearTimeout(t)}
};
