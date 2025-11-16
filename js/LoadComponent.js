export async function loadComponent(id,file){
    const container=document.getElementById(id);
    if(container){
        const html=await fetch(file).then(res=>res.text());
        container.innerHTML=html;
    }

}