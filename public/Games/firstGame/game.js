/* ── A Dark Forest — JS port of program5.py ── */
(function () {
  const term = document.getElementById('terminal');
  const inp  = document.getElementById('input');
  let resolver = null;

  /* ── I/O helpers ── */
  function print(text, cls) {
    const div = document.createElement('div');
    div.className = 'line' + (cls ? ' ' + cls : '');
    div.textContent = text;
    term.appendChild(div);
    term.scrollTop = term.scrollHeight;
  }

  function ask() {
    return new Promise(resolve => {
      inp.disabled = false;
      inp.focus();
      resolver = resolve;
    });
  }

  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter' && resolver) {
      const val = inp.value.trim();
      print('> ' + val, 'dim');
      inp.value = '';
      const r = resolver;
      resolver = null;
      inp.disabled = true;
      r(val);
    }
  });

  /* ── Utilities ── */
  function rand(min, max) { return Math.floor(Math.random() * (max - min)) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ── Game state (mirrors Python aa array) ── */
  // [0]name [1]hp [2]atk [3]speed [4]agility [5]intell [6]luck
  // [7]gold [8]sword [9]cake [10]tablets [11]maxHP [12]prog
  // [13]wand [14]mana [15]maxMana [16]bludgeon
  let aa = [];

  /* ── Title Screen ── */
  async function titleScreen() {
    print('');
    print('* welcome to a dark forest *', 'highlight');
    print('');
    print('* enter the name of your character *');
    const name = await ask();

    print('');
    print('* pick one: strength, health, speed *', 'info');
    let a1 = (await ask()).toLowerCase();
    while (a1 !== 'strength' && a1 !== 'health' && a1 !== 'speed') {
      print('* pick one: strength, health, speed *', 'info');
      a1 = (await ask()).toLowerCase();
    }

    print('');
    print('* pick another: intelligence, luck, agility *', 'info');
    let a2 = (await ask()).toLowerCase();
    while (a2 !== 'intelligence' && a2 !== 'luck' && a2 !== 'agility') {
      print('* pick another: intelligence, luck, agility *', 'info');
      a2 = (await ask()).toLowerCase();
    }

    print('');
    print('* choose an item: sword, gold, cake *', 'info');
    let item = (await ask()).toLowerCase();
    while (item !== 'sword' && item !== 'gold' && item !== 'cake') {
      print('* choose an item: sword, gold, cake *', 'info');
      item = (await ask()).toLowerCase();
    }

    let hp = 10, atk = 1, speed = 1, agility = 0, intell = 1, luck = 1;
    let gold = 10, sword = 0, cake = 3;

    if (a1 === 'health')   hp += 3;
    if (a1 === 'strength') atk += 1;
    if (a1 === 'speed')    speed += 1;
    if (a2 === 'agility')     agility += 1;
    if (a2 === 'intelligence') intell += 1;
    if (a2 === 'luck')        luck += 1;
    if (item === 'gold')  gold += 10;
    if (item === 'sword') sword += 1;
    if (item === 'cake')  cake += 3;

    aa = [name, hp, atk, speed, agility, intell, luck, gold, sword, cake,
          0/*tablet*/, hp/*maxHP*/, 0/*prog*/, 0/*wand*/, 10/*mana*/, 10/*maxMana*/, 0/*bludgeon*/];
  }

  /* ── Wake-up scene ── */
  async function aDarkForest() {
    print('');
    print('----------------------------------------------------------------------------------------------------------', 'dim');
    print('');
    print('* you wake up on a dirt path, dark trees swaying all around you *');
    print('');
    print('* you attempt to stand up and double over, what happened? *');
    print('');
    print('* blood stains your clothes, scratch marks run down your legs and arms *');
    if (aa[8] === 1) {
      print('');
      print('* looking behind you, you find a wooden sword, nearly broken *');
    }
    print('');
    print('* you check your pockets, ' + aa[7] + ' gold pieces and ' + aa[9] + ' cake *', 'gold');
    print('');
    print('* your name is all you remember, ' + aa[0], 'highlight');
    print('');
    print('* you gather your belongings and start down the path, the moon glistening above *');
    await path();
  }

  /* ── Main path loop ── */
  async function path() {
    aa[12] += 1;
    print('');
    print('* | (n)orth | (e)ast | (s)outh | (w)est | *', 'info');
    print('* | (q)uit  | (d)isplay stats  | (g)old | *', 'info');
    let c = '';
    while (!['n','e','s','w','q','d','g'].includes(c)) {
      c = (await ask()).toLowerCase();
    }
    if (c === 'q') { print(''); print('* you lay down on the forest floor and close your eyes forever... *', 'damage'); return; }
    if (c === 'g') { print(''); print('| * ' + aa[7] + ' shiny gold pieces * |', 'gold'); aa[12] -= 1; return path(); }
    if (c === 'd') { aa[12] -= 1; stats(); return path(); }
    return pathChance();
  }

  /* ── Random encounter ── */
  async function pathChance() {
    const opts = ['easyEnemy','easyEnemy','easyEnemy','nothing','nothing','nothing','nothing'];
    if (aa[12] >= 1)  opts.push('alter');
    if (aa[12] >= 5)  opts.push('shop');
    if (aa[12] >= 40) opts.push('secret');
    if (aa[12] >= 10) opts.push('hardEnemy');
    if (aa[12] >= 20) opts.push('hardEnemy');
    if (aa[12] >= 30) { const i = opts.indexOf('easyEnemy'); if (i !== -1) opts.splice(i, 1); }
    if (aa[12] >= 40) { const i = opts.indexOf('easyEnemy'); if (i !== -1) opts.splice(i, 1); opts.push('alter'); }
    if (aa[12] >= 45) opts.push('hardEnemy');
    if (aa[12] >= 55) { const i = opts.indexOf('easyEnemy'); if (i !== -1) opts.splice(i, 1); }
    if (aa[4] === 1)  opts.push('difficultPath');

    const ev = pick(opts);
    if (ev === 'easyEnemy')    return easyCombat(0);
    if (ev === 'hardEnemy')    return easyCombat(1);
    if (ev === 'alter')        return alter();
    if (ev === 'shop')         return shop();
    if (ev === 'nothing')      return nothing();
    if (ev === 'difficultPath') return difficultPath();
    if (ev === 'secret')       return secret();
  }

  /* ── Difficult Path ── */
  async function difficultPath() {
    const g = rand(30, 50);
    print('* you make your way through a difficult path using your agility skills and find ' + g + ' gold pieces', 'gold');
    aa[7] += g;
    return path();
  }

  /* ── Secret ── */
  async function secret() {
    print('* while walking you stumble upon a huge rock wall and 5 empty slots inside the wall *');
    print('* the voice behind the trees whispers... spell the word *', 'highlight');
    const word = (await ask()).toLowerCase();
    if (word === 'exile') {
      print('* you slot the tablets into the wall...exile...suddenly a section of the wall crumbles to dust and you stand in front of a black gaping hole... *', 'highlight');
      print('* you enter the cave and light a torch... unfortunately by doing so you accidentally woke the gigantic sleeping dragon directly in front of you *', 'damage');
      print('* before you even have time to react it opens its eyes and swings its tail, swatting you against the cave wall and breaking some of your bones *', 'damage');
      print('* you stand and face the Dragon *', 'highlight');
      return easyCombat(2);
    } else {
      print('* you spell ' + word + ' but nothing happens... *');
      return path();
    }
  }

  /* ── Shop ── */
  async function shop() {
    print('* you overhear a man talking to himself just behind a row of bushes *');
    print("* as to not be spotted you peer over the bush and see an old man, or possibly human-watcher hybrid, sitting under an artificial light *");
    print("* he appears to be friendly and its clear he's selling various items which are propped up on tables with prices on next to them *");
    print('* you walk through the bushes and the man greets you with a somewhat cautious smile, "hello traveler - purchase something won\'t you" *');
    print("* you take a look at what he's selling... *");
    print('* |---|SHOP|---| *', 'highlight');
    return realShop();
  }

  async function realShop() {
    print('* |Gold Pieces: ' + aa[7] + '| *', 'gold');
    let cakePrice = 15, wandPrice = 250;
    if (aa[5] === 2) { cakePrice -= 2; wandPrice -= 10; }
    if (aa[5] === 3) { cakePrice -= 3; wandPrice -= 20; }
    if (aa[5] === 4) { cakePrice -= 4; wandPrice -= 30; }
    if (aa[5] === 5) { cakePrice -= 5; wandPrice -= 40; }

    const wandLabel = aa[13] === 1 ? 'Wand Purchased' : '(w)and';
    if (aa[13] === 0) {
      print('* Items Available: |(c)ake < ' + cakePrice + ' g >| ' + wandLabel + ' ' + wandPrice + ' |(e)xit the shop| *', 'info');
    } else {
      print('* Items Available: |(c)ake < ' + cakePrice + ' g >| ' + wandLabel + ' |(e)xit the shop| *', 'info');
    }

    let p = '';
    while (!['c','e','w'].includes(p)) { p = (await ask()).toLowerCase(); }

    if (p === 'c') {
      if (aa[7] >= cakePrice) {
        print('* you bought 1 slice of cake for ' + cakePrice + ' gold pieces *', 'heal');
        aa[9] += 1;
        aa[7] -= cakePrice;
      } else {
        print('* you cannot afford that *', 'damage');
        return realShop();
      }
    }
    if (p === 'e') {
      print('* you thank the man and continue down the trail again... *');
      return path();
    }
    if (p === 'w') {
      if (aa[13] === 0) {
        if (aa[7] >= wandPrice) {
          aa[13] = 1;
          aa[7] -= wandPrice;
          print('* you bought the wand *', 'highlight');
        } else {
          print('* you cannot afford that *', 'damage');
          return realShop();
        }
      } else {
        print('* you already purchased the wand *');
        return realShop();
      }
    }

    print('* do you want to purchase more stuff? (y/n) *');
    let more = '';
    while (more !== 'y' && more !== 'n') { more = (await ask()).toLowerCase(); }
    if (more === 'y') return realShop();
    print('* you thank the man for the goods and set down the trail once more... *');
    return path();
  }

  /* ── Altar ── */
  async function alter() {
    print('* as you carefully walk through the woods you notice a strange stone obelisk in the middle of the forest... *');
    print('* you reach out to touch it and it sends a shock through your whole body... *');
    print('* you hear a voice somewhere in the woods... choose *', 'highlight');
    return realAlter();
  }

  async function realAlter() {
    const pool = ['strength','health','speed','intelligence','luck','mana'];
    let o1, o2, o3;
    do { o1 = pick(pool); o2 = pick(pool); o3 = pick(pool); }
    while (o1 === o2 || o1 === o3 || o2 === o3);

    print('* | ' + o1 + ' | ' + o2 + ' | ' + o3 + ' | *', 'info');
    let c = '';
    while (c !== o1 && c !== o2 && c !== o3) { c = (await ask()).toLowerCase(); }

    if (c === 'strength')     { print('* you feel power course through your veins *', 'highlight'); aa[2] += 1; }
    if (c === 'health')       { print('* you feel the iron in your blood solidify *', 'heal'); const t = pick([1,1,1,1,2,2,2,2,2,3,3,3,4,4,5]); aa[1] += t; aa[11] += t; }
    if (c === 'speed') {
      if (aa[3] <= 4) { print('* you feel quicker and lighter on your feet *', 'highlight'); aa[3] += 1; }
      else { print('* you already are as quick as they come *'); print('* suddenly the alter glows white and youre blinded by the light... when you regain sight, the alter has changed... *', 'highlight'); return realAlter(); }
    }
    if (c === 'intelligence') {
      if (aa[5] <= 4) { print('* you feel smarter and more savvy *', 'highlight'); aa[5] += 1; }
      else { print('* you already are as smart as they come *'); print('* suddenly the alter glows white and youre blinded by the light... when you regain sight, the alter has changed... *', 'highlight'); return realAlter(); }
    }
    if (c === 'luck') {
      if (aa[6] <= 4) { print('* you feel the urge to go buy a lottery ticket *', 'highlight'); aa[6] += 1; }
      else { print('* you already are as lucky as they come... *'); print('* suddenly the alter glows white and youre blinded by the light... when you regain sight, the alter has changed... *', 'highlight'); return realAlter(); }
    }
    if (c === 'mana') { print('* arcane energy fills your mind *', 'highlight'); aa[15] += 3; }

    print('* although you are not sure what just happened you press forward... *');
    return path();
  }

  /* ── Nothing events ── */
  async function nothing() {
    const n = rand(1, 8); // 1-7
    if (n === 1) {
      print('');
      print('* you trudge forward, trees in every direction... *');
      return path();
    }
    if (n === 2) {
      if (aa[10] <= 4) {
        print('');
        print("* stumbling through the foliage you spot something laying in a bush... you pick up a stone tablet, a red glow emitting from it... *", 'highlight');
        print("* you added the tablet to your inventory (stats) *", 'info');
        aa[10] += 1;
      } else {
        const g = rand(1, 30);
        print('');
        print('* as you make your way through a bush you notice something shiny and pickup ' + g + ' gold pieces', 'gold');
        aa[7] += g;
      }
      return path();
    }
    if (n === 3) {
      print('');
      print('* walking down the path you spot some cake laying in a ditch beside you... *');
      print('* you added 1 cake to your inventory (stats) *', 'info');
      aa[9] += 1;
      return path();
    }
    if (n === 4) {
      print('');
      print('* you move forward, ducking between the low hanging branches... *');
      return path();
    }
    if (n === 5) {
      print('');
      print('* you look up at the moon and contemplate how you ended up here, unfortunately you hit a tree branch and took 1 damage *', 'damage');
      aa[1] -= 1;
      if (aa[1] <= 0) {
        print('* somehow that tree branch managed to kill you and you die on the forest floor... *', 'damage');
        return;
      }
      return path();
    }
    if (n === 6) {
      print('');
      print('* you notice a creature in the woods but it has yet to notice you... *');
      print('* do you want to attack the monster? (y/n) *');
      let yn = '';
      while (yn !== 'y' && yn !== 'n') { yn = (await ask()).toLowerCase(); }
      if (yn === 'y') {
        const hard = pick([0,0,0,0,1]);
        return easyCombat(hard);
      }
      print('* probably a smart decision... *');
      return path();
    }
    // n === 7
    print('* you come across a stream in the forest, you plunge your hands in and feel your wounds close... *', 'heal');
    print('* HP Restored *', 'heal');
    aa[1] = aa[11];
    return path();
  }

  /* ── Combat ── */
  async function easyCombat(hardVar) {
    aa[14] = aa[15]; // restore mana
    const atk = aa[2], speed = aa[3], luck = aa[6], sword = aa[8];

    let monsters;
    if (hardVar === 0)      monsters = { Zombie:[10,1,3,0,1,5,10], Skeleton:[8,2,3,1,2,8,14], Jelly:[6,1,3,0,3,10,20], Wanderer:[3,3,4,2,3,20,30] };
    else if (hardVar === 1) monsters = { Silent:[10,3,6,2,3,20,30], Watcher:[8,4,7,3,5,30,50], Evoker:[5,6,8,2,6,30,60], Defect:[1,20,30,2,3,100,200] };
    else                    monsters = { Dragon:[10,100,120,5,15,1000,2000] };

    const preWords = ['terrifying','horrific','insane','grotesque','mad','wild'];

    // weighted selection
    const entries = Object.entries(monsters);
    let total = 0;
    for (const [, v] of entries) total += v[0];
    let sel = rand(0, total), hp2 = 0, enemy = entries[0][0];
    for (const [k, v] of entries) {
      hp2 += v[0];
      if (sel < hp2) { enemy = k; break; }
    }

    const m = monsters[enemy];
    let mobHealth = rand(m[1], m[2]);
    const maxMobHP = mobHealth;
    let goldDrop = rand(m[5], m[6]);
    if (luck === 2) goldDrop += 10;
    if (luck === 3) goldDrop += 20;
    if (luck === 4) goldDrop += 30;
    if (luck === 5) goldDrop += 50;

    if (hardVar === 0 || hardVar === 1) {
      print('');
      print('* stumbling along you run into a ' + pick(preWords) + ' ' + enemy + ' *', 'damage');
    }

    while (aa[1] >= 1 && mobHealth >= 1) {
      let sp = 0;
      if (sword === 0) sp = atk;
      else if (sword === 1) sp = atk + 1;
      else if (sword === 2) sp = atk + 2;
      else if (sword === 3) sp = atk + 4;
      else if (sword === 4) sp = atk * 2;
      else if (sword === 5) sp = atk * 3;
      const varAtk = [sp - 1, sp, sp + 1];
      const dmg = pick(varAtk);

      const minD = m[3], maxD = m[4];

      print('');
      print('* health: ' + aa[1] + '/' + aa[11] + ' | attack: <' + varAtk[0] + '-' + varAtk[2] + '> | mana: ' + aa[14] + ' | ' + enemy + ' health: ' + mobHealth + '/' + maxMobHP + ' | attack: <' + minD + '-' + maxD + '> *', 'info');
      print('* what do you do? |(f)ight|(r)un away|(c)ast spell|(e)at cake| *');
      let c = '';
      while (!['f','r','c','e'].includes(c)) { c = (await ask()).toLowerCase(); }

      if (c === 'f') {
        print('* you swing at the ' + enemy + ' dealing ' + dmg + ' damage *', 'highlight');
        mobHealth -= dmg;
        if (mobHealth <= 0) {
          if (hardVar === 2) {
            print('* you defeated the dragon...as his head hits the floor the stone wall behind it opens up revealing sunlight... you step out into the fresh air...not a tree in sight *', 'highlight');
            print('');
            print('THANK YOU FOR PLAYING', 'highlight');
            return;
          }
          print('* you defeated the ' + enemy + ' and gained ' + goldDrop + ' gold pieces *', 'gold');
          aa[7] += goldDrop;
          return path();
        }
        const mobAtk = rand(minD, maxD);
        print('* the ' + enemy + ' swings at you dealing ' + mobAtk + ' damage *', 'damage');
        aa[1] -= mobAtk;
      } else if (c === 'r') {
        if (hardVar === 2) { print('* you cannot escape the dragon *', 'damage'); continue; }
        const chances = ['1','2'];
        if (speed === 1) chances.push('3','4','5','6');
        else if (speed === 2) chances.push('3','4','5');
        else if (speed === 3) chances.push('3','4');
        else if (speed === 4) chances.push('3');
        if (pick(chances) === '1') {
          print('* you escaped the fight and gained nothing *');
          return path();
        }
        print('* you failed to escape and the ' + enemy + ' swings at you *', 'damage');
        const mobAtk = rand(minD, maxD);
        aa[1] -= mobAtk;
      } else if (c === 'c') {
        const spellDmg = (atk * 2) - 1;
        if (aa[13] === 1) {
          if (aa[14] >= 3) {
            aa[14] -= 3;
            print('* you cast a spell and dealt ' + spellDmg + ' damage *', 'highlight');
            mobHealth -= spellDmg;
            if (mobHealth <= 0) {
              if (hardVar === 2) {
                print('* You defeat the dragon and notice light shining behind where the dragon was standing... *', 'highlight');
                print('* You step out into the light and look around... not a tree in sight *', 'highlight');
                print('* THANK YOU FOR PLAYING *', 'highlight');
                return;
              }
              print('* you defeated the ' + enemy + ' and gained ' + goldDrop + ' gold pieces *', 'gold');
              aa[7] += goldDrop;
              return path();
            }
            const mobAtk = rand(minD, maxD);
            print('* the ' + enemy + ' swings at you dealing ' + mobAtk + ' damage *', 'damage');
            aa[1] -= mobAtk;
          } else {
            print('* you are all out of mana *', 'damage');
          }
        } else {
          print('* you have no idea how to use a spell or how you would even cast one *');
        }
      } else if (c === 'e') {
        if (aa[9] <= 0) { print('* you are all out of cake *', 'damage'); }
        else if (aa[1] === aa[11]) { print('* you already have the maximum amount of health *'); }
        else {
          print('* you stop for a second to have a nice slice of cake *', 'heal');
          aa[1] += 5;
          aa[9] -= 1;
          if (aa[1] > aa[11]) aa[1] = aa[11];
        }
      }
    }

    if (aa[1] <= 0) {
      print('');
      print('* you succumbed to the ' + enemy + ' and died *', 'damage');
      return;
    }
    if (hardVar === 2) {
      print('');
      print('* you slay the dragon and collect your spoils...a section of the wall collapses behind the dragon and you step out of the cave into the sunlight... not a tree in sight *', 'highlight');
      print('');
      print('THANK YOU FOR PLAYING', 'highlight');
      return;
    }
    print('');
    print('* you defeated the ' + enemy + ' and gained ' + goldDrop + ' gold pieces *', 'gold');
    aa[7] += goldDrop;
    return path();
  }

  /* ── Stats display ── */
  function stats() {
    const perks = [];
    if (aa[4] === 1) perks.push('Agility (Allows different path traversal)');
    if (aa[16] === 1) perks.push("Bludgeon (Deals massive damage one time)");
    const swordNames = ['No Sword','Wooden Sword','Bronze Sword','Iron Sword','Blackstone Sword','Magical Sword'];

    print('');
    print(' ---- | ' + aa[0] + ' | ---- ', 'highlight');
    print('|Health       < ' + aa[1] + ' / ' + aa[11] + ' >');
    print('|Attack       < ' + aa[2] + ' >');
    print('|Mana         < ' + aa[15] + ' >');
    print('|Speed        < ' + aa[3] + ' / 5 >');
    print('|Intelligence < ' + aa[5] + ' / 5 >');
    print('|Luck         < ' + aa[6] + ' / 5 >');
    print('|Sword        < ' + swordNames[aa[8]] + ' >');
    print('|Gold         < ' + aa[7] + ' >', 'gold');
    print('|Cake         < ' + aa[9] + ' >');
    print('|Perks:       < ' + (perks.length ? perks.join(', ') : 'No Perks') + ' >');
    if (aa[13] === 1) print('|Wand         < Yes >');
    const tablets = ['','E','EX','EXI','EXIL','EXILE'];
    if (aa[10] >= 1 && aa[10] <= 5) {
      print('|Tablets      < ' + tablets[aa[10]] + ' >', 'highlight');
    }
  }

  /* ── Start ── */
  async function main() {
    await titleScreen();
    await aDarkForest();
  }
  main();
})();
