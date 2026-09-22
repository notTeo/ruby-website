(function(){
  var nav=document.getElementById('nav'),
      hero=document.getElementById('top'),
      textLayer=document.getElementById('textLayer'),
      glassLayer=document.getElementById('glassLayer'),
      letters=document.getElementById('letters'),
      fades=[].slice.call(document.querySelectorAll('.js-fade')),
      reduce=window.matchMedia('(prefers-reduced-motion: reduce)'),
      portrait=window.matchMedia('(max-aspect-ratio: 1/1)'),
      ticking=false;

  function update(){
    var heroR=hero.getBoundingClientRect();
    var y=Math.max(0,-heroR.top), vh=window.innerHeight;   // scroll distance, read from the page itself
    nav.classList.toggle('is-scrolled', y>30);

    if(!reduce.matches){
      var isP=portrait.matches;
      // depth: the RUBY text lags behind (far), the glass barely lags (near)
      textLayer.style.transform='translate3d(0,'+(y*(isP?0:0.4))+'px,0)';
      glassLayer.style.transform='translate3d(0,'+(y*(isP?0.18:0.3))+'px,0)';
      fades.forEach(function(el){
        if(isP){el.style.transform='';el.style.opacity='';return;}
        el.style.transform='translate3d(0,'+(y*0.15)+'px,0)';
        el.style.opacity=Math.max(0,1-y/(vh*0.5));
      });
    }

    // Small logo appears once the big RUBY letters are ~80% gone (under the nav or under the next section)
    var navB=nav.getBoundingClientRect().bottom, lr=letters.getBoundingClientRect();
    var visible=Math.min(lr.bottom,heroR.bottom)-Math.max(lr.top,navB);
    nav.classList.toggle('logo-in', visible<=lr.height*0.2);
    ticking=false;
  }
  function onScroll(){ if(!ticking){ticking=true;requestAnimationFrame(update);} }
  document.addEventListener('scroll',onScroll,{passive:true,capture:true});
  window.addEventListener('resize',onScroll);
  update();
})();

(function(){
  function fmtDate(iso){
    var d=new Date(iso);
    if(isNaN(d)) return iso;
    return d.toLocaleString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  }

  function photoTile(src,label,thumb){
    var cls='ph'+(thumb?' ph--thumb':'');
    return '<div class="'+cls+'" role="img" aria-label="'+label+' photo">'+
      '<img src="'+src+'" alt="'+label+'" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'\';">'+
      '<svg viewBox="0 0 64 64" aria-hidden="true" style="display:none"><use href="#martini"/></svg>'+
    '</div>';
  }

  function renderCatalog(data){
    var el=document.getElementById('menuGroups');
    if(!el||!data||!data.categories) return;
    el.innerHTML=data.categories.map(function(cat){
      var items=(cat.items||[]).map(function(it){
        return '<li class="item">'+photoTile(it.image,it.name,true)+
          '<div class="item__body"><div class="item__row"><span>'+it.name+'</span><span class="item__dots" aria-hidden="true"></span><span class="item__price">'+it.price+'</span></div>'+
          '<p class="item__desc">'+it.description+'</p></div></li>';
      }).join('');
      return '<div class="menu__group" id="'+cat.id+'"><h3>'+cat.name+'</h3><ul>'+items+'</ul></div>';
    }).join('');
  }

  function renderEvents(data){
    var el=document.getElementById('eventsContent');
    if(!el||!data) return;
    var events=data.events||[];
    if(!events.length){
      el.innerHTML='<p class="events-empty">No events scheduled at the moment \u2014 check back soon.</p>';
      return;
    }
    el.innerHTML='<div class="events-list">'+events.map(function(ev){
      return '<div class="event">'+photoTile(ev.image,ev.title,true)+
        '<div><h3 class="event__title">'+ev.title+'</h3>'+
        '<span class="event__dates">'+fmtDate(ev.dateStart)+' \u2013 '+fmtDate(ev.dateEnd)+'</span>'+
        '<p class="event__desc">'+ev.description+'</p></div></div>';
    }).join('')+'</div>';
  }

  function renderAbout(data){
    var el=document.getElementById('aboutPhotos');
    if(!el||!data||!data.photos) return;
    el.innerHTML=data.photos.map(function(p){ return photoTile(p.image,p.alt||'',false); }).join('');
  }

  function load(url,cb){
    fetch(url).then(function(r){return r.json();}).then(cb).catch(function(err){console.error('Failed to load '+url,err);});
  }

  load('data/catalog.json',function(d){renderCatalog(d);window.dispatchEvent(new Event('resize'));});
  load('data/events.json',function(d){renderEvents(d);window.dispatchEvent(new Event('resize'));});
  load('data/about.json',function(d){renderAbout(d);window.dispatchEvent(new Event('resize'));});
})();
