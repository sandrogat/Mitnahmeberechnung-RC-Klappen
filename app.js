
const $=id=>document.getElementById(id)
const num=v=>Number(v)||0
const atanDeg=x=>Math.atan(x)*180/Math.PI



function applyDefaults(){
  const wing = document.querySelector('input[name="wing"]:checked').value;

  if(wing === "4"){
    $("gap").value = 8;
    $("wk").value = 52;
    $("qr1").value = 78;
    // no qr2 / wk1 / wk2 in this mode

    $("depthWK").value = 75;
    $("depthQR1").value = 55;
    $("qrUp").value = 20;
    $("qrDown").value = -8;

  } else if(wing === "6"){
    $("gap").value = 5;
    $("wk").value = 72;
    $("qr1").value = 58;
    $("qr2").value = 20;

    $("depthWK").value = 60;
    $("depthQR1").value = 28;
    $("depthQR2").value = 28;
    $("qrUp").value = 20;
    $("qrDown").value = -10;

  } else if(wing === "8"){
    $("gap").value = 5;
    $("wk1").value = 82;
    $("wk2").value = 62;
    $("qr1").value = 40;
    $("qr2").value = 18;

    $("depthWK1").value = 68;
    $("depthWK2").value = 48;
    $("depthQR1").value = 35;
    $("depthQR2").value = 28;
    $("qrUp").value = 20;
    $("qrDown").value = -10;
  }
}

function toggleFields(){
  const wing = document.querySelector('input[name="wing"]:checked').value;

  const show4 = wing === "4";
  const show6 = wing === "6";
  const show8 = wing === "8";

  // WK (single) is used in 4 & 6
  document.querySelectorAll(".wk").forEach(el => el.classList.toggle("hidden", !(show4 || show6)));

  // WK1/WK2 are used in 8 only
  document.querySelectorAll(".wk1").forEach(el => el.classList.toggle("hidden", !show8));
  document.querySelectorAll(".wk2").forEach(el => el.classList.toggle("hidden", !show8));

  // QR2 is used in 6 & 8 only
  document.querySelectorAll(".qr2").forEach(el => el.classList.toggle("hidden", !(show6 || show8)));
}

function makeRow(name,factor,depth){
const up=num($("qrUp").value)*factor
const down=num($("qrDown").value)*factor
return{
name,
up, upDeg: atanDeg(up/depth),
down, downDeg: atanDeg(down/depth)
}
}

function calc(){

const wing=document.querySelector('input[name="wing"]:checked').value
const gap=num($("gap").value)
let rows=[]

if(wing==="4"){

const lenWK=num($("wk").value)
const lenQR=num($("qr1").value)

const posWK=gap+lenWK/2
const posQR=gap+lenWK+lenQR/2

rows.push(makeRow("WK",posWK/posQR,num($("depthWK").value)))
rows.push(makeRow("QR",1,num($("depthQR1").value)))

}

if(wing==="6"){

const lenWK=num($("wk").value)
const lenQR1=num($("qr1").value)
const lenQR2=num($("qr2").value)

const posWK=gap+lenWK/2
const posQR1=gap+lenWK+lenQR1/2
const posQR2=gap+lenWK+lenQR1+lenQR2/2

rows.push(makeRow("WK",posWK/posQR2,num($("depthWK").value)))
rows.push(makeRow("QR1",posQR1/posQR2,num($("depthQR1").value)))
rows.push(makeRow("QR2",1,num($("depthQR2").value)))

}

if(wing==="8"){

const lenWK1=num($("wk1").value)
const lenWK2=num($("wk2").value)
const lenQR1=num($("qr1").value)
const lenQR2=num($("qr2").value)

const posWK1=gap+lenWK1/2
const posWK2=gap+lenWK1+lenWK2/2
const posQR1=gap+lenWK1+lenWK2+lenQR1/2
const posQR2=gap+lenWK1+lenWK2+lenQR1+lenQR2/2

rows.push(makeRow("WK1",posWK1/posQR2,num($("depthWK1").value)))
rows.push(makeRow("WK2",posWK2/posQR2,num($("depthWK2").value)))
rows.push(makeRow("QR1",posQR1/posQR2,num($("depthQR1").value)))
rows.push(makeRow("QR2",1,num($("depthQR2").value)))

}

render(rows)
}

function render(rows){
const tbody=$("result")
tbody.innerHTML=""
rows.forEach(r=>{
tbody.innerHTML+=`
<tr>
<td>${r.name}</td>
<td>${r.up.toFixed(1)} mm<br>${r.upDeg.toFixed(1)}°</td>
<td>${r.down.toFixed(1)} mm<br>${r.downDeg.toFixed(1)}°</td>
</tr>`
})
}

document.querySelectorAll("input").forEach(i=>i.addEventListener("input",calc))
document.querySelectorAll('input[name="wing"]').forEach(i=>i.addEventListener("change",()=>{applyDefaults();toggleFields();calc()}))

applyDefaults()
toggleFields()
calc()

function generateMarkdown() {

  const wing = document.querySelector('input[name="wing"]:checked').value
  const qrUp = $("qrUp").value
  const qrDown = $("qrDown").value

  let md = `### Klappen-Mitnahme\n`
  md += `Flügeltyp: ${wing}-Klappen  \n`
  md += `QR: +${qrUp} / ${qrDown} mm\n\n`
  md += `| Klappe | + mm | + ° | - mm | - ° |\n`
  md += `|--------|------|-----|------|-----|\n`

  document.querySelectorAll("#result tr").forEach(tr => {
    const cells = tr.querySelectorAll("td")
    const name = cells[0].innerText
    const plus = cells[1].innerText.split("\n")
    const minus = cells[2].innerText.split("\n")

    md += `| ${name} | ${plus[0].replace(" mm","")} | ${plus[1].replace("°","")} | ${minus[0].replace(" mm","")} | ${minus[1].replace("°","")} |\n`
  })

  return md
}

document.getElementById("copyMarkdown").addEventListener("click", () => {
  const md = generateMarkdown()
  navigator.clipboard.writeText(md)
})