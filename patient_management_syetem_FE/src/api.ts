export type User={id:number;name:string;email:string;role:'patient'|'doctor';specialty?:string}
export type Doctor=Pick<User,'id'|'name'|'specialty'>
export type Appointment={id:number;patient_id:number;doctor_id:number;slot_time:string;status:'booked'|'cancelled'|'completed';patient_name:string;doctor_name:string;specialty?:string}
const BASE=import.meta.env.VITE_API_URL||'http://localhost:8000/api'
let token=localStorage.getItem('token')
export const setToken=(value:string|null)=>{token=value;value?localStorage.setItem('token',value):localStorage.removeItem('token')}
export async function api<T>(path:string,options:RequestInit={}):Promise<T>{
 const response=await fetch(`${BASE}${path}`,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})}})
 const data=await response.json().catch(()=>({detail:'Unexpected server response'}))
 if(!response.ok)throw new Error(typeof data.detail==='string'?data.detail:'Request failed')
 return data
}

