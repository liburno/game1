var data = [
    { nazione: 'ing', colore: 'rosso' },
    { nazione: 'sve', animale: 'cane' },
    { nazione: 'dan', bevanda: 'te' },
    { colore: 'verde', bevanda: 'caffe' },
    { fuma: 'pall', animale: 'uccelli' },
    { colore: 'giallo', fuma: 'dunhill' },
    { id: 2, bevanda: 'latte' },
    { id: 0, nazione: 'nor' },
    { fuma: 'bluemaster', bevanda: 'birra' },
    { nazione: 'ger', fuma: 'prince' },
    { colore: 'bianco' },
    { fuma: 'blends' },
    { animale: 'gatto' },
    { animale: 'cavallo' },
    { animale: 'pesce' },
    { colore: 'blu' },
    { bevanda: 'acqua' }
]

// ************** normalizza i dati per avere l'elenco delle informazioni:
var fields = []
for (var d of data) {
    for (var x in d) {
        if (x != 'id') fields.push(x);
    }
}
fields = [...new Set(fields)];
console.log('Elenco proprietà', fields);
var maxtipi = fields.length;
var tot = {};
for (var d of data) {
    var r = [];
    for (var f in d) {
        r.push(f);
    }
    d.fields = r;
    for (var x of fields) {
        if (!tot[x]) tot[x] = [];
        if (d[x]) tot[x].push(d[x]);
    }
}
for (var x of fields) {
    tot[x] = [...new Set(tot[x])];
}
console.log('Possibili valori', tot);

// -------------------- funzione fondamentale per calcolare la fitness di una combinazione
var calcolaErrori = (list) => {
    var er = 0;
    var matcherr = (dd) => {
        for (var d of data) {
            var n1 = d.fields.length, n2 = 0;
            if (n1 > 1) {
                for (var i = 0; i < d.fields.length; i++) {
                    var f = d.fields[i];
                    if (d[f] == dd[f]) n2++;
                }
            }
            if (n2 > 0 && n2 != n1) er++; // cè un errore se non sono soddisfatte contemporaneamente tutte le condizioni
        }
    }
    var matchAltri = (d) => {
        var sx = d.id > 0 ? list[d.id - 1] : {};
        var dx = d.id < maxtipi - 1 ? list[d.id + 1] : {};
        if (d.colore == 'verde' && !(dx.colore == 'bianco')) er++                           //la casa verde è a sinistra di quella bianca
        if (d.fuma == 'blends' && !(sx.animale == 'gatto' || dx.animale == 'gatto')) er++;    // l'uomo che fuma le blends vive vicino a quello che ha i gatti
        if (d.animale == 'cavallo' && !(sx.fuma == 'dunhill' || dx.fuma == 'dunhill')) er++;  //l'uomo che ha i cavalli vive vicino a quello che fuma le dunhill
        if (d.nazione == 'nor' && !(sx.colore == 'blu' || dx.colore == 'blu')) er++           //il norvegese vive vicino alla casa blu
        if (d.blends == 'blends' && !(sx.bevanda == 'acqua' || dx.bevanda == 'acqua')) er++;  // l'uomo che fuma le blends ha un vicino che beve acqua
    }
    for (var dd of list) {
        matcherr(dd);
        matchAltri(dd);
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

class DNA {
    constructor(genera = true) {
        this.fitness = 0;
        this.data = [];
        if (genera) {
            for (var x of fields) {   // scombina i valori
                tot[x] = shuffle(tot[x]);
            }
            for (var i = 0; i < maxtipi; i++) {
                var s = { id: i };
                for (var x of fields) {
                    s[x] = tot[x][i];
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
        for (var x of fields) r1.push(pad(x, 10));
        r.push(r1.join(','));
        for (var d of this.data) {
            r1 = [];
            r1.push(pad(d.id, 5));
            for (var x of fields) r1.push(pad(d[x], 10));
            r.push(r1.join(','));
        }
        return r;
    }
    generate(father, scambi) {
        var res = new DNA(false);
        for (var i = 0; i < maxtipi; i++) {
            res.data.push({ id: i });
        }
        // mescola il DNA dei genitori
        for (var x of fields) {
            var rx = Math.random();

            if (rx < .55) {
                for (var i = 0; i < maxtipi; i++) res.data[i][x] = this.data[i][x]; // genes from mother are dominants
            } else {
                for (var i = 0; i < maxtipi; i++) res.data[i][x] = father.data[i][x];
            }
        }
        // e crea alcune variazioni casuali
        for (var i = 0; i < scambi; i++) {
            var i1 = randint(fields.length);
            var i2 = randint(fields.length);
            var i3 = fields[randint(fields.length)];
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
console.log("gen:",w.gens);
console.log(w.pop[0].dump());
