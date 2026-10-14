(function(){
  /* ---- Explorar: hotspots ---- */
  var P=[
    {id:'star',name:'Estrella calada',x:21.8,y:42.2,img:'img/carrusel/d-tip.jpg',tag:'Acrílico cristal · 15 mm',
     text:'La estrella de cuatro puntas se corta como un vacío en el acrílico, igual que la contraforma dentro de cada «A» del logotipo. Sus cuatro puntas remiten a los actores del ecosistema: Estado, academia, empresas y comunidad.'},
    {id:'logo',name:'Logotipo',x:62.5,y:18.6,img:'img/d-logo.jpg',tag:'Impresión UV blanca',
     text:'El logotipo de ASTRA se imprime en blanco sobre la parte más oscura del degradado, donde el contraste es mayor y la marca se lee a distancia.'},
    {id:'grad',name:'Degradado',x:67.4,y:53.4,img:'img/d-curve.jpg',tag:'Impresión UV a color',
     text:'El color pasa de azul profundo a azul eléctrico, turquesa y verde menta: la misma transición del sistema visual de la marca. El verde aparece abajo, donde el cuerpo se une a la base.'},
    {id:'edge',name:'Canto pulido',x:78.4,y:26,img:'img/carrusel/d-edge.jpg',tag:'Espesor · 1,5 cm',
     text:'Los bordes pulidos del acrílico de 15 mm captan la luz y la conducen por el contorno, de modo que la silueta de la estrella brilla aun en un escenario oscuro.'},
    {id:'base',name:'Base',x:51.5,y:73.9,img:'img/d-base.jpg',tag:'17 × 6 × 4 cm',
     text:'Bloque de acrílico azul translúcido que sostiene el cuerpo y le da estabilidad. Lleva la leyenda «Premio a la Innovación Sostenible» grabada o impresa en blanco.'}
  ];
  var pic=document.getElementById('pic'),list=document.getElementById('points');
  var dImg=document.getElementById('d-img'),dT=document.getElementById('d-title'),dX=document.getElementById('d-text'),dG=document.getElementById('d-tag');
  P.forEach(function(p,i){
    var b=document.createElement('button');b.className='hs';b.type='button';b.style.left=p.x+'%';b.style.top=p.y+'%';
    b.setAttribute('aria-label',p.name);b.dataset.i=i;b.addEventListener('click',function(){set(i)});pic.appendChild(b);
    var li=document.createElement('li'),lb=document.createElement('button');lb.type='button';lb.dataset.i=i;
    lb.innerHTML='<span><span class="dot"></span>'+p.name+'</span><span class="mono">'+p.tag+'</span>';
    lb.addEventListener('click',function(){set(i)});li.appendChild(lb);list.appendChild(li);
  });
  function set(i){
    var p=P[i];
    document.querySelectorAll('[data-i]').forEach(function(el){el.classList.toggle('on',+el.dataset.i===i)});
    dImg.src=p.img;dImg.alt=p.name;dT.textContent=p.name;dX.textContent=p.text;dG.textContent=p.tag;
    var det=dImg.parentNode;det.classList.remove('swap');void det.offsetWidth;det.classList.add('swap');
  }
  set(0);

  /* ---- Ficha técnica ---- */
  var svg=document.getElementById('plan'),seg=document.querySelectorAll('.seg button'),vn=document.getElementById('viewname');
  function view(v){
    svg.querySelectorAll('.view').forEach(function(g){g.hidden=g.dataset.v!==v});
    seg.forEach(function(b){var on=b.dataset.view===v;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
    vn.textContent=v==='front'?'Vista frontal':'Vista de perfil';
  }
  /* La animación de trazado corre una sola vez, al entrar la sección en pantalla (ver observer abajo) */
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function draw(g){
    if(reduce||!g)return;
    g.classList.remove('anim');void g.getBoundingClientRect();g.classList.add('anim');
    g.querySelectorAll('.dim').forEach(function(d,i){d.style.setProperty('--d',i)});
    g.querySelectorAll('path[fill="none"], .dim line:not(.ext)').forEach(function(el,i){
      var L;try{L=el.getTotalLength()}catch(e){return}
      el.style.transition='none';el.style.strokeDasharray=L;el.style.strokeDashoffset=L;
      el.getBoundingClientRect();
      el.style.transition='stroke-dashoffset 1.1s cubic-bezier(.6,0,.2,1) '+(i*40)+'ms';el.style.strokeDashoffset=0;
    });
  }
  if('IntersectionObserver' in window){
    var drawn=false,po=new IntersectionObserver(function(es){if(es[0].isIntersecting&&!drawn){drawn=true;draw(svg.querySelector('.view:not([hidden])'))}},{threshold:.35});
    po.observe(svg);
  }
  seg.forEach(function(b){b.addEventListener('click',function(){view(b.dataset.view)})});
  function focusDim(d,v){
    var cur=svg.querySelector('.view:not([hidden])').dataset.v;
    if(d && !svg.querySelector('.view[data-v="'+cur+'"] [data-dim="'+d+'"]')) view(v);
    svg.classList.toggle('focus',!!d);
    svg.querySelectorAll('.dim').forEach(function(g){g.classList.toggle('on',g.dataset.dim===d)});
    document.querySelectorAll('#rows li').forEach(function(li){li.classList.toggle('on',li.dataset.dim===d)});
  }
  document.querySelectorAll('#rows li').forEach(function(li){
    li.addEventListener('mouseenter',function(){focusDim(li.dataset.dim,li.dataset.view)});
    li.addEventListener('focus',function(){focusDim(li.dataset.dim,li.dataset.view)});
    li.addEventListener('click',function(){focusDim(li.dataset.dim,li.dataset.view)});
    li.addEventListener('mouseleave',function(){focusDim(null)});
    li.addEventListener('blur',function(){focusDim(null)});
  });

  /* ---- Galería: carrusel curvo ----
     Una fila de imágenes avanza de derecha a izquierda por el interior de un cilindro: el centro se ve plano y
     los extremos se curvan hacia el espectador y se desvanecen. Una caja CSS no se puede doblar, así que cada
     tile se corta en SLICES tiras verticales, cada una girada unos grados alrededor del eje del cilindro. Todo
     el movimiento es un solo rotateY por tile (compositor); el JS solo mide y cambia la imagen al dar la vuelta. */
  var curve=document.getElementById('curve');
  if(curve){
    var C={
      images:['img/carrusel/front.jpg','img/carrusel/premio-astra-3.png','img/carrusel/d-tip.jpg','img/carrusel/persp.jpg',
              // {src,pos}: pos = encuadre del recorte (object-position); acá se corre a la derecha para mostrar al hombre
              {src:'img/carrusel/premio-astra-4.png',pos:'100% 50%'},'img/carrusel/hand.jpg','img/carrusel/d-edge.jpg'],
      speed:4,        // segundos para avanzar un tile
      tile:52,        // alto del tile, % del alto de la sección
      aspect:4/5,     // ancho / alto del tile (las fotos son verticales)
      gap:8,          // espacio entre tiles, % del alto del tile
      axis:55,        // centro vertical de la fila, % del alto
      curve:72,       // cuánto se curva la fila hacia el borde, en grados (5–85)
      fade:12         // ancho del desvanecido en cada extremo, % del ancho
    };
    var SLICES=16,CAMERA=1.6,MAX_WIDTH=55;
    var band=curve.querySelector('.curve-band');
    var bend=Math.min(85,Math.max(5,C.curve))*Math.PI/180;
    var deg=function(r){return r*180/Math.PI};
    var rnd=function(n){return +n.toFixed(4)};
    // Radio del cilindro (en fracción del ancho) que deja el borde del cuadro a `bend` radianes del centro
    var arc=(CAMERA-1+Math.cos(bend))/(2*CAMERA*Math.sin(bend));
    var radius=(100*arc).toFixed(3)+'cqw';
    function turn(d){return 'translateZ('+radius+') rotateY('+rnd(d)+'deg) translateZ(-'+radius+')'}
    // Toda medida es múltiplo del alto del tile, que sigue al alto de la sección salvo en pantallas angostas
    curve.style.setProperty('--u','min('+C.tile+'cqh,'+rnd(MAX_WIDTH/C.aspect)+'cqw)');
    function u(n){return 'calc('+rnd(n)+' * var(--u))'}

    function measure(w,h){
      var th=Math.min(C.tile/100*h,MAX_WIDTH/100*w/C.aspect),r=w*arc;
      if(!(th>0)||!(r>0))return {columns:2,sweep:0,unit:0,limit:0};
      var unit=deg(th/r),pitch=(C.aspect+C.gap/100)*unit,limit=deg(bend)+C.aspect*unit/2;
      var columns=Math.min(60,Math.max(2,Math.ceil(2*limit/pitch))),sweep=rnd(columns*pitch/2);
      return {columns:columns,sweep:sweep,unit:rnd(unit),limit:rnd(Math.min(sweep,limit))};
    }

    var kf=document.createElement('style');document.head.appendChild(kf);
    var shown=[],layout=null;
    C.images.forEach(function(s){new Image().src=s.src||s});

    function build(L){
      // Fuera de `limit` el tile está completamente fuera de cuadro: ahí se oculta y ahí da la vuelta
      var hide=rnd((L.sweep-L.limit)/(2*L.sweep||1)*100);
      kf.textContent='@keyframes curve-orbit{from{transform:'+turn(-L.sweep)+'}to{transform:'+turn(L.sweep)+'}'+
        '0%,'+hide+'%,'+(100-hide)+'%,100%{visibility:hidden}'+(hide+.001)+'%,'+(100-hide-.001)+'%{visibility:visible}}';
      var mask='linear-gradient(90deg,transparent,#000 '+C.fade+'%,#000 '+(100-C.fade)+'%,transparent)';
      band.style.perspective=(100*arc*CAMERA).toFixed(3)+'cqw';
      band.style.perspectiveOrigin='50% '+C.axis+'%';
      band.style.maskImage=band.style.webkitMaskImage=mask;
      band.textContent='';

      var share=C.aspect/SLICES,dur=L.columns*C.speed;
      for(var t=0;t<L.columns;t++)(function(t){
        var first=L.columns-1-t,imgs=[];
        var tile=document.createElement('div');tile.className='curve-tile';
        tile.style.cssText='left:calc(50% - '+u(C.aspect/2)+');top:calc('+C.axis+'% - '+u(.5)+');width:'+u(C.aspect)+';height:'+u(1)+
          ';--dur:'+dur+'s;--delay:'+(-t*C.speed)+'s';
        for(var k=0;k<SLICES;k++){
          var s=document.createElement('div');s.className='curve-slice';
          s.style.cssText='left:'+u((C.aspect-share)/2)+';width:'+(k===SLICES-1?u(share):'calc('+u(share)+' + 1px)')+
            ';height:'+u(1)+';transform:'+turn((C.aspect/2-(k+.5)*share)*L.unit);
          var im=document.createElement('img');im.alt='';im.draggable=false;
          im.style.cssText='left:'+u(-k*share)+';width:'+u(C.aspect)+';height:'+u(1);
          s.appendChild(im);tile.appendChild(s);imgs.push(im);
        }
        function show(n){
          shown[t]=n;var it=C.images[n%C.images.length],src=it.src||it,pos=it.pos||'';
          imgs.forEach(function(im){if(im.getAttribute('src')!==src)im.src=src;im.style.objectPosition=pos});
        }
        show(shown[t]!=null?shown[t]:first);
        // Cada vuelta (fuera de cuadro) el tile toma la siguiente imagen de la lista
        tile.addEventListener('animationiteration',function(e){show(Math.round(e.elapsedTime/dur)*L.columns+first)});
        band.appendChild(tile);
      })(t);
      band.classList.add('ready');
    }

    var raf=0;
    new ResizeObserver(function(es){
      var r=es[0].contentRect;cancelAnimationFrame(raf);
      raf=requestAnimationFrame(function(){
        var n=measure(r.width,r.height);
        if(layout&&layout.columns===n.columns&&layout.sweep===n.sweep&&layout.unit===n.unit)return;
        layout=n;build(n);
      });
    }).observe(curve);
  }

  /* ---- Aparición al hacer scroll ----
     Cada objeto entra con su propio efecto; los que entran juntos se escalonan en orden. Al terminar se quitan
     las clases, así la animación no deja un contexto de apilamiento (rompería el mix-blend-mode del trofeo). */
  var R=[
    ['#concepto .quote .eyebrow','up'],['#concepto blockquote','blur'],['#concepto .quote > p:last-child','up'],
    ['#concepto .starcard','scale'],['#concepto .actors span','pop'],
    ['#explorar .pic img','left'],['#explorar .hs','pop'],['#explorar .side h2','blur'],['#explorar .panel','right'],
    ['#explorar .points li','right'],['#explorar .detail','up'],
    ['#ficha .head h2','blur'],['#ficha .head p','up'],['#ficha .spec','scale'],
    ['#ficha .table .eyebrow','up'],['#ficha .table h3','up'],['#ficha .rows li','right'],['#ficha .note','up'],
    ['#galeria .curve-copy h2','blur'],['#galeria .curve-copy > p','up'],
    ['footer img','up'],['footer .wrap > span','up']
  ];
  if(!reduce&&'IntersectionObserver' in window){
    document.documentElement.classList.add('js-reveal');
    var ro=new IntersectionObserver(function(es){
      es.filter(function(e){return e.isIntersecting}).forEach(function(e,i){
        var el=e.target;ro.unobserve(el);
        el.style.setProperty('--rd',Math.min(i,10)*90+'ms');el.classList.add('in');
      });
    },{rootMargin:'0px 0px -12% 0px',threshold:.15});
    R.forEach(function(r){document.querySelectorAll(r[0]).forEach(function(el){
      el.classList.add('reveal');el.dataset.reveal=r[1];ro.observe(el);
      el.addEventListener('animationend',function done(ev){
        if(ev.target!==el||ev.animationName.indexOf('rv-')!==0)return;
        el.removeEventListener('animationend',done);el.classList.remove('reveal','in');el.removeAttribute('data-reveal');el.style.removeProperty('--rd');
      });
    })});
  }

  /* ---- Nav activa ---- */
  var links={};document.querySelectorAll('.nav ul a').forEach(function(a){links[a.getAttribute('href').slice(1)]=a});
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){
      Object.keys(links).forEach(function(k){links[k].classList.toggle('on',k===e.target.id)})}})},{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(links).forEach(function(k){var s=document.getElementById(k);if(s)io.observe(s)});
  }
})();
