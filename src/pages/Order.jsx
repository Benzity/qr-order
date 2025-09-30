import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { askPermissionAndGetId } from '../lib/push'

// 임시 메뉴
const MENUS = [
  { id:'beer', name:'맥주', price:4000 },
  { id:'soju', name:'소주', price:4000 },
  { id:'chips', name:'감자칩', price:2000 },
  { id:'skewer', name:'꼬치', price:3000 }
]

export default function Order(){
  const params = new URLSearchParams(location.search)
  const tableNo = params.get('table') || 'X'
  const [cart, setCart] = useState({})
  const [note, setNote] = useState('')
  const [contact, setContact] = useState('')
  const total = useMemo(()=>Object.entries(cart).reduce((s,[id,qty])=>{
    const m = MENUS.find(m=>m.id===id); return s + (m?.price||0)*qty
  },0),[cart])

  const add = (id)=> setCart(c => ({...c, [id]:(c[id]||0)+1}))
  const sub = (id)=> setCart(c => {
    const q=(c[id]||0)-1; const n={...c}; if(q<=0) delete n[id]; else n[id]=q; return n;
  })

  async function submit(){
    const playerId = await askPermissionAndGetId().catch(()=>null)
    const items = Object.entries(cart).map(([id,qty])=>{
      const m = MENUS.find(m=>m.id===id)
      return { menu_id:id, name:m.name, qty }
    })
    if(items.length===0){ alert('메뉴를 선택하세요'); return; }

    const { data, error } = await supabase.from('orders').insert([{
      table_no: tableNo,
      items, note, contact,
      status:'접수',
      player_id: playerId || null
    }]).select().single()

    if(error){ alert('주문 실패: '+error.message); return; }
    alert(`주문 완료! 주문번호: ${data.id.slice(0,8)}`)
    setCart({}); setNote(''); setContact('')
  }

  return (
    <div style={{padding:16, fontFamily:'sans-serif'}}>
      <h2>테이블 {tableNo} 주문</h2>
      <div>
        {MENUS.map(m=>(
          <div key={m.id} style={{display:'flex', gap:8, alignItems:'center', margin:'8px 0'}}>
            <div style={{width:120}}>{m.name}</div>
            <div style={{width:60}}>{m.price.toLocaleString()}원</div>
            <button onClick={()=>sub(m.id)}>-</button>
            <span>{cart[m.id]||0}</span>
            <button onClick={()=>add(m.id)}>+</button>
          </div>
        ))}
      </div>

      <div style={{marginTop:12}}>
        <textarea placeholder="요청사항" value={note} onChange={e=>setNote(e.target.value)} />
      </div>
      <div style={{marginTop:8}}>
        <input placeholder="연락처(선택)" value={contact} onChange={e=>setContact(e.target.value)} />
      </div>

      <h3>합계 {total.toLocaleString()}원</h3>
      <button onClick={submit} style={{padding:'8px 16px'}}>주문하기</button>

      <p style={{marginTop:12, color:'#666'}}>결제는 현장 결제/계좌이체</p>
    </div>
  )
}