



var names = ["fulvio", "gabriele", "lazzaro", "marcello"];
var premi = [500, 700, 800, 1000, 1300];








function randint(valore) { return Math.floor(Math.random() * valore) }
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

// funzioni di servizio 
var iswinner = (n) => { return n == 'fulvio' } // vince sempre 
var getcoppia = (n1, n2) => {               // le coppie sono ordinate alfabeticamete, per vel. controllo
    return n1 < n2 ? [n1, n2] : [n2, n1]
}
var stessacombinazione = (c1, c2) => {
    return c1[0] == c2[0] && c1[1] == c2[1]
}
var generapartita=()=> {
    names = shuffle(names);
    if (iswinner(names[0]) || iswinner(names[1])) {
        return { w: getcoppia(names[0], names[1]), l: getcoppia(names[2], names[3]) }
    } else {
        return { w: getcoppia(names[2], names[3]), l: getcoppia(names[0], names[1]) }
    }

}


class DNA {
    constructor(genera = true) {
        this.fitness = 0;
        this.partite = [];
        if (genera) {
            for (var i = 0; i < 5; i++) {
                this.partite.push(generapartita())
            }
            this.calcolapunti();
        }
    }
    calcolapunti() {
        var ft = 0;
        this.points = {};
        for (var n of names) { this.points[n] = 0; }
        var pp=this.partite;
        var i = 0;
        for (var p of pp) {
            this.points[p.w[0]] += premi[i];
            this.points[p.w[1]] += premi[i];
            this.points[p.l[0]] -= premi[i];
            this.points[p.l[1]] -= premi[i];
            i++;
        }
        if (stessacombinazione(pp[0].w,pp[1].w)) ft+=5;
        if (stessacombinazione(pp[0].w,pp[2].w)) ft+=5;
        if (stessacombinazione(pp[1].w,pp[2].w)) ft+=5;
        if (stessacombinazione(pp[3].w,pp[4].w)) ft+=5;
        var pp=this.points;
        if (pp.lazzaro!=pp.marcello+2000) ft++;
        if (pp.lazzaro<pp.gabriele && pp.gabriele<0) ft++;
        this.fitness=ft;
    }
    dump() {
        var v=[];
        var pp=this.partite;
        for (var i=0;i<5;i++) {
            var p=pp[i];
            v.push(`${p.w[0]}+${p.w[1]}  vincono vs ${p.l[0]}+${p.l[1]}`);
        }
        v.push(` ------  fulvio:${this.points.fulvio}  marcello:${this.points.marcello}  lazzaro:${this.points.lazzaro}  gabriele:${this.points.gabriele}  ------`)
        return v.join('\n')

    }
    generate(father, scambi) {
        var res = new DNA(false);
        if (Math.random()<.1) {
            res.partite.push(generapartita())
            res.partite.push(generapartita())
            res.partite.push(generapartita())
            
        } else {
            res.partite.push(this.partite[1])
            res.partite.push(this.partite[2])
            res.partite.push(this.partite[0])
        }
        if (Math.random()<.1) {
            res.partite.push(generapartita())
            res.partite.push(generapartita())
      

        } else {
            res.partite.push(father.partite[4]);
            res.partite.push(father.partite[3]);
        }
        res.calcolapunti();
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
console.log(w.pop[0].dump());
