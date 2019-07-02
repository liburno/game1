# un questito di logica risolto con un algoritmo genetico

[questo articolo è anche nel mio sito](https://ipazia.alk.hr/#/articleedit/91)

Il quesito proposto appartiene a una famiglia di problemi simili, che ho trovato spesso nella settimana enigmistica (prova di intelligenza, quesito di gedeone...) in cui si deve ricavare uno schema a partire da alcuni indizi.

Anzichè provare a risolverlo nel modo tradizionale, ho provato ad applicare un algorimo genetico alla soluzione del problema e sembra che funzioni abbastanza bene. 
Non mi interessa la soluzione, ma mostrare il funzionamento dell'algoritmo passo passo.

Dunque: *in una strada ci sono cinque case dipinte in cinque colori differenti.
In ogni casa vive una persona di differente nazionalità. Ognuno dei padroni di casa beve una differente bevanda, fuma una differente marca di sigarette e tiene un animale differente.
Domanda: a chi appartiene il **pesce?***

Questi sono gli indizi:

- *L'inglese vive in una casa rossa.*
- *Lo svedese ha un cane.*
- *Il danese beve tè.*
- *La casa verde è all'immediata sinistra della casa bianca.*
- *Il padrone della casa verde beve caffé.*
- *La persona che fuma le Pall Mall, ha degli uccellini.*
- *Il proprietario della casa gialla fuma le Dunhill's.*
- *L'uomo che vive nella casa centrale, beve latte.*
- *Il norvegese vive nella prima casa.*
- *L'uomo che fuma le Blends, vive vicino a quello che ha i gatti.*
- *L'uomo che ha i cavalli, vive vicino all'uomo che fuma le Dunhill's.*
- *L'uomo che fuma le Blue Master, beve birra.*
- *Il tedesco fuma le Prince.*​
- *Il norvegese vive vicino alla casa blu.*
- *L'uomo che fuma le Blends, ha un vicino che beve acqua.*

### Soluzione trovata 
```
  'id,nazione,colore,animale,bevanda,fuma',
  '0 ,nor,    giallo,gatto  ,acqua  ,dunhill',
  '1 ,dan,    blu,   cavallo,te     ,blends',
  '2 ,ing,    rosso, uccelli,latte,  pall',
  '3 ,ger,    verde, pesce  ,caffe,  prince',
  '4 ,sve,    bianco,cane   ,birra  ,bluemaster' 
```
e quindi **il pesce appartiene al tedesco**...

### il programma:

Utilizzando javascript e node ho definito per prima cosa i vincoli sotto forma di struttura, semplificando i termini per una migliore lettura..

```javascript
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
    { colore: 'bianco' },  // da qui in poi mi servono le informazioni per cercare le combinazioni
    { fuma: 'blends' },
    { animale: 'gatto' },
    { animale: 'cavallo' },
    { animale: 'pesce' },
    { colore: 'blu' },
    { bevanda: 'acqua' }
]
```

quindi ho provveduto a creare la griglia delle possibili combinazioni, un po di js per avere l'elenco dei campi (fields) e dei valori (tot)

```javascript
var fields = []
for (var d of data) {
    for (var x in d) {
        if (x != 'id') fields.push(x);
    }
}
fields = [...new Set(fields)]; // voglio solo valori unici!
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
    tot[x] = [...new Set(tot[x])]; // anche qui solo valori unici
}
console.log('Possibili valori', tot);
```
il risultato sulla console è questo:
```javascript
Elenco proprietà [ 'nazione', 'colore', 'animale', 'bevanda', 'fuma' ]
Possibili valori { nazione: [ 'ing', 'sve', 'dan', 'nor', 'ger' ],
  colore: [ 'rosso', 'verde', 'giallo', 'bianco', 'blu' ],
  animale: [ 'cane', 'uccelli', 'gatto', 'cavallo', 'pesce' ],
  bevanda: [ 'te', 'caffe', 'latte', 'birra', 'acqua' ],
  fuma: [ 'pall', 'dunhill', 'bluemaster', 'prince', 'blends' ] }
```

### il calcolo dell'errore
usando un algoritmo genetico, creerò combinazioni casuali di questi valori, e calcolerò una "fitness" legata al numero di errori della combinazione creata. 
Farò in modo che in ogni generazioni si accoppino solo gli elementi con la "fitness" migliore per creare la nuova generazione. 
Il programma sarà terminato quando avrò trovato l'individuo perfetto, ossia quello che non contiene errori.

Procediamo con la funzione che verifica una combinazione particolare combinazione (l'ho chiamata DNA) calconandone il numero di condizioni che non sono soddisfatte, in questo modo la fitness massima è 0 errori:

```javascript
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
```

Mi servono a questo punto due funzioni globali, per calcolare i valori casuali e per mescolare casualmente l'array delle possibilità:

```javascript
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
```
Veniamo quindi all'oggetto del test, l'individo che identifico tramite il suo DNA. L'individuo è creato in due modi: casualmente all'inizio e generato da due genitori, con alcuni geni mutati per ogni generazione (scambi)

Questa è la classe che rappresenta l'individuo

```javascript
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
    generate(father, scambi) {
        var res = new DNA(false);
        for (var i = 0; i < maxtipi; i++) {
            res.data.push({ id: i });
        }
        // mescola il DNA dei genitori
        for (var x of fields) {
            var rx = Math.random();
            if (rx < .55) {
                for (var i = 0; i < maxtipi; i++) res.data[i][x] = this.data[i][x]; // i geni della madre sono leggermente dominanti
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
```

La popolazione è fatta di un nucleo di individui, che si evolgono di generazione in generazione. Ho chiamato la classe per la loro gestione "World" e come proprietà ci sono i singoli individui (array pop)

```javascript
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
                if (xx.fitness == this.pf) { // cerca di capire se mandare il "diluvio universale"
                    this.pfc++;
                    if (this.pfc > 300) {    // ... e lo fa dopo 300 generazioni in cui non succede niente
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
                    var mother = this.pop[randint(this.tieni)];
                    var father = this.pop[randint(i)];
                    this.pop.push(mother.generate(father, this.scambi));
                }
            }
        }
        return this.done;
    }
}

```
All'inizio il costruttore crea la popolazione in modo casuale con un numero massimo di individui (maxpop). tiene solo i più sani tra una generazione e l'altra (tieni) e ha una variabile scambi, per alterazioni casuali del DNA.

L'evoluzione termina quando un individuo ha raggiunto la fitness=0. questo è l'"eletto" e il risultato della ricerca.

Nell'algoritmo di soluzione ho messo anche un filtro "diluvio universale" che rigenera l'intera popolazione quando per un certo numero di generazioni non vi sia stato miglioramento.

A questo punto l'ultima parte del programma che crea il risultato....

```javascript
var w = new World(200, 40, 2);
for (; ;) {
    if (w.evolve()) break;
}
console.log(w.pop[0]);
```

Ovviamente è un algoritmo generico tranne che per la prima parte dove sono impostate le condizioni, e può essere applicato facilmente a tutti i problemi di questo tipo. 
Ricordiamoci che se non esiste soluzione potrebbe continuare all'infinito, mentre se ce n'è più di una si ferma alla prima..

buon divertimento!

```bash
node game
```

