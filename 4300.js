var fields = {
    name: ['bice', 'cristina', 'federica', 'sara'],
    dogname: ['lampo', 'nebbia', 'stella', 'vento'],
    dog: ['cocker', 'bracco', 'spinone', 'mastino']
}
var ft = [];
for (var x in fields) ft.push(x);


console.log('Elenco proprietà:', fields);

console.log('------------------------------------------')

// -------------------- funzione fondamentale per calcolare la fitness di una combinazione
var calcolaErrori = (list) => {
    var er = 0;
    var idfromprop = (prop, value) => {
        for (var f of list) {
            if (f[prop] == value) return f.id;
        }
        console.log(`error ${prop}:${value}`);
        return -1;

    }


    var matcherr = (d) => {
        var sx = d.id > 0 ? list[d.id - 1] : {};
        var dx = d.id < maxtipi - 1 ? list[d.id + 1] : {};

        if (d.name == 'bice' && d.dogname == 'lampo') er++ // lampo non è di bice
        if (d.dogname == 'lampo') {
            if (d.name=='bice') er++;     // lampo non è di bice
            if (!((sx.dog == 'cocker' && dx.dogname == 'nebbia') ||
                (dx.dog == 'cocker' && sx.dogname == 'nebbia'))) er++; 
                // il cane precedente o successivo sono rispettivamente cocker e nebbia
            if (d.dog == 'cocker') er++
        }
        if (d.dogname == 'nebbia' && d.dog == 'cocker') er++;

        // stella incrocia federica (ma non sara e non il bracco e il mastino)
        if (d.dogname == 'stella') {
            if (d.dog == 'bracco' || d.dog == 'mastino') er++;
            if (sx.dog == 'bracco' || sx.dog == 'mastino') er++;
            if (dx.dog == 'bracco' || dx.dog == 'mastino') er++;
            if (sx.name != 'federica' && dx.name != 'federica') er++;
            if (sx.name == 'sara' || dx.name == 'sara') er++;

        }

        if (d.name == 'sara' && d.dog != 'mastino') er++;
        
        if (d.name=='sara' && d.id >= idfromprop('dog','cocker'))  er++;          // sara predede cocker
        if (d.dogname=='nebbia' && d.id >=idfromprop('name','cristina'))  er++;  // nebbia prima di cane cristina   
        if (d.dogname=='vento' && d.id <=idfromprop('name','bice'))  er++;     // vento dopo cane di bice
        if (d.dog=='spinone' && d.id <=!idfromprop('name','federica'))  er++; // spinone dopo cane di federica     
   



    }
    
    for (var dd of list) {
        matcherr(dd);
    }

    return er;
}
function randint(valore) { return Math.floor(Math.random() * valore) }
// scombina un array per generare sequenze pseuxo casuali ---------
function shuffle(array) {
    let counter = array.length;
    while (counter > 0) {
        let index = randint(counter)
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}
var maxtipi = 0;
class DNA {
    constructor(genera = true) {
        this.fitness = 0;
        this.data = [];
        if (genera) {
            for (var x in fields) {   // scombina i valori
                if (!maxtipi) maxtipi = fields[x].length;
                fields[x] = shuffle(fields[x]);
            }
            for (var i = 0; i < maxtipi; i++) {
                var s = { id: i };
                for (var x in fields) {
                    s[x] = fields[x][i];
                }
                this.data.push(s);
            }
            this.fitness = calcolaErrori(this.data);
            return this;
        }
    }
    dump() {
        var r = [], r1 = [];
        var pad = (str, l) => { return (str + '                       ').substr(0, l); }
        r.push(`fitness:${this.fitness}`);
        r1.push(pad("id", 5));
        for (var x in fields) r1.push(pad(x, 10));
        r.push(r1.join(','));
        for (var d of this.data) {
            r1 = [];
            r1.push(pad(d.id, 5));
            for (var x in fields) r1.push(pad(d[x], 10));
            r.push(r1.join(','));
        }
        return r.join('\n');
    }
    generate(father, scambi) {
        var res = new DNA(false);
        for (var i = 0; i < maxtipi; i++) {
            res.data.push({ id: i });
        }
        // mescola il DNA dei genitori
        for (var x in fields) {
            var rx = Math.random();
            if (rx < .55) {
                for (var i = 0; i < maxtipi; i++) res.data[i][x] = this.data[i][x]; // genes from mother are dominants
            } else {
                for (var i = 0; i < maxtipi; i++) res.data[i][x] = father.data[i][x];
            }
        }
        // e crea alcune variazioni casuali
        for (var i = 0; i < scambi; i++) {
            var i1 = randint(maxtipi);
            var i2 = randint(maxtipi);
            var i3 = ft[randint(ft.length)];
            if (i1 != i2) {
                var t = res.data[i1][i3];
                res.data[i1][i3] = res.data[i2][i3];
                res.data[i2][i3] = t;
            }
        }
        res.fitness = calcolaErrori(res.data)
        return res;
    }
}


class World {
    constructor(maxpop, tieni, scambi) {
        this.gens = 0;
        this.done = false;
        this.maxpop = maxpop;
        this.tieni = tieni;
        this.scambi = scambi;
        this.randomcrea();
    }
    randomcrea() {
        this.pf = 0;
        this.pfc = 0;
        this.pop = [];
        for (var i = 0; i < this.maxpop; i++) {
            this.pop.push(new DNA());
        }

    }
    evolve() {
        if (!this.done) {
            this.gens++;
            this.pop = this.pop.sort((a, b) => { return a.fitness - b.fitness })
            var xx = this.pop[0];
            if (xx.fitness <= 0) {
                this.done = true;
            } else {
                var xx = this.pop[0];

                if (xx.fitness == this.pf) {
                    this.pfc++;
                    if (this.pfc > 300) { // l'arca di noè
                        this.randomcrea();
                        return this.done;
                    }
                } else {
                    this.pf = xx.fitness;
                    this.pfc = 0;
                }

                if (this.gens % 1000 == 0) {
                    console.log(this.gens, xx.fitness);
                }

                this.pop.length = this.tieni;
                for (var i = this.tieni; i < this.maxpop; i++) {
                    var mather = this.pop[randint(this.tieni)];
                    var father = this.pop[randint(i)];

                    this.pop.push(mather.generate(father, this.scambi));
                }

            }
        }
        return this.done;
    }
}




var w = new World(200, 40, 2);
for (; ;) {
    if (w.evolve()) break;
}
console.log("gen:", w.gens);
var res=w.pop[0];
console.log(res.dump());

for (var x of res.data) {
    if (x.dog=='bracco') {
        console.log(`\nil bracco appartiene a ${x.name}, si chiama ${x.dogname} ed è stato visitato per ${['primo','secondo','terzo','quarto'][x.id]}`);
    }

}
