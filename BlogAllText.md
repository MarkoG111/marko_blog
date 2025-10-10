***Tema projekta**

***Korisceni programski jezici i biblioteke**

***Redosled kojim implemeniram projekte je sledeći:**

1. Domain
2. EFDataAccess
3. Application
4. Implementation
5. API
6. Client

***Kako komuniciraju slojevi?**

**Klasična predstava "vrh prema dnu":**
U mnogim višeslojnim arhitekturama, komunikacija ide od najvišeg sloja (npr. API) prema najnižem (npr. EFDataAccess), što znači da API poziva Application sloj, koji zatim komunicira sa Domain slojem ili eventualno poziva direktno neke servise iz Implementation ili pristupa podacima.

Međutim, ovo **ne znači nužno** da svaki sloj striktno komunicira **samo** sa onim ispod njega. Evo nekoliko ključnih tačaka:

**Usmereni tok zavisnosti:**

Idealno, zavisnosti bi trebalo da teku "prema unutra". U Clean Architecture ili sličnim pristupima, unutrašnji slojevi (Domain i Application) su potpuno nezavisni od spoljašnjih implementacija (kao što su EFDataAccess, API, Client). To se postiže korišćenjem Dependency Inversion principa – višim slojevima se ubrizgavaju interfejsi koji su definisani u unutrašnjim slojevima, a konkretne implementacije dolaze iz spoljašnjih slojeva (kao što je Implementation ili EFDataAccess). Na primer, Application sloj može definisati interfejs za repozitorijum, dok je njegovu konkretnu implementaciju smeštena u Implementation sloju.

**Preskakanje slojeva:**
U praksi, ponekad je potrebno da neki viši sloj direktno koristi entitete iz Domain sloja, bez prolaska kroz Application sloj. Na primer, API kontroleri mogu direktno koristiti DTO (Data Transfer Objects) koje su bazirane na Domain modelima, ali to treba raditi pažljivo kako ne bi došlo do nepotrebne zavisnosti.

**Primena principa separacije odgovornosti:**
Svaki sloj ima jasnu ulogu. API sloj ne bi trebao da sadrži poslovnu logiku – on samo preuzima zahteve, validira ih na nivou transporta i prosleđuje Application sloju. Isto tako, Application sloj se ne bavi tehničkim detaljima pristupa bazi, što je zadatak EFDataAccess sloja.



*Iz mojih konfiguracija se moze videti kako su postavljene reference medju projektima:

**API projekat:**
Referencira Application, Domain, EFDataAccess i Implementation projekte. To znači da API ima pristup svim ključnim delovima sistema, ali to je uobičajeno zato što je API ulazna tačka aplikacije.
Ovakva referenca omogućava API-ju da orkestrira operacije pozivajući servise definisane u Application sloju, a koji su implementirani koristeći logiku iz Domain i EFDataAccess slojeva. 

**Ostali projekti:**
Svaki projekat ima svoje specifične reference koje odražavaju njihovu ulogu. Na primer, projekat koji sadrži samo domain model ima referencu samo ka Domain projektu, dok Implementation i EFDataAccess projekti imaju reference prema Domainu, a Implementation dodatno prema Application i EFDataAccess slojevima.



***Da li svaki sloj komunicira samo sa onim ispod sebe?**

**U idealnom slučaju, komunikacija ide tako da:**

- **API sloj**:
  Poziva servise iz **Application sloja**.
- **Application sloj**:
  Koristi logiku iz **Domain sloja** i delegira tehničke zadatke (npr. pristup bazi) konkretnoj implementaciji koja može biti smeštena u **EFDataAccess** ili **Implementation** slojevima.
- **Implementation i EFDataAccess slojevi**:
  Oni obezbeđuju konkretne operacije koje se koriste od strane Application sloja, ali se same ne pozivaju direktno iz API-ja.

Ponekad, iz praktičnih razloga, API sloj može direktno pristupiti nekim elementima iz Domain sloja (npr. za validaciju ili transformaciju podataka), ali to treba raditi pažljivo da se ne naruši modularnost.

Takođe, u nekim slučajevima Application sloj može komunicirati direktno sa više slojeva, u zavisnosti od konkretnih potreba i složenosti poslovne logike.

**Najbolja praksa:**

- **Decoupling i Dependency Injection:** Koristi DI kako bi se osigurala niska povezanost između slojeva.
- **Definisanje jasnih interfejsa:** Time se omogućava zamena konkretnih implementacija bez uticaja na višlje slojeve.
- **Separation of concerns:** Svaki sloj treba da bude odgovoran samo za svoju oblast, čime se olakšava testiranje i održavanje koda.



U praksi, **komunikacija između slojeva nije striktno ograničena samo na "sloj ispod"**, već je organizovana tako da viši slojevi zavise od nižih putem dobro definisanih interfejsa, a ne direktnim referencama na implementacije. Ovo ti omogućava da, na primer, API sloj pozove Application sloj, koji zatim koristi Domain sloj i delegira pristup podacima slojevima koji su za to zaduženi.



Komanda za kreiranje: *dotnet new classlib -n Domain*

1. <u>**Domain folder**</u> Sadrži sve osnovne entitete i domenske modele koji opisuju poslovnu logiku i pravila aplikacije. Tu se nalaze klase koje definišu poslovne koncepte i njihove međusobne odnose. To je sloj sa definicijama objekata i njihovim vezama. Ti izlistani objekti predstavljaju tabele. 
   On je najnezavisniji deo sistema. (Npr. prodavnica ne može da postoji bez: kupca, prodavca, korpe, proizvoda).

   **Cilj domenskog sloja** je da enkapsulira poslovnu logiku i pravila aplikacije. On predstavlja srž sistema i treba da bude izolovan od tehničkih detalja (npr. pristup bazi podataka). Tvoj domenski sloj sadrži entitete koji modeluju osnovne koncepte – korisnike, postove, komentare, kategorije, veze između njih i druge bitne aspekte sistema.

   **Korišćenje nasleđivanja:** `BaseEntity` obezbeđuje zajednička svojstva (kao što su identifikator, datumi kreiranja/modifikacije/brisanja, status aktivnosti/brisanja), što smanjuje dupliranje koda. Podržava mehanizme za soft delete i praćenje vremena kreiranja/modifikacije. Centralizuje zajednička svojstva svih entiteta, što je odlična praksa za DRY (Don't Repeat Yourself).

   **Navigaciona svojstva i kolekcije:** Omogućavaju EF Core-u da kreira relacije između entiteta, olakšavajući rad sa podacima i podršku za Lazy Loading (ako je konfigurisan).

   **ICollection<T>** je generički interfejs koji predstavlja kolekciju objekata.
   **HashSet<T>** je implementacija ICollection<T> interfejsa koja garantuje jedinstvenost elemenata u kolekciji. To znači da svaki element u kolekciji mora biti jedinstven.

`Category` Jasno modeluje kategorije, pri čemu se koristi kolekcija `PostCategory` za definisanje many-to-many relacije sa postovima. Kolekcija je inicijalizovna (HashSet<T>) kako bi se izbegli null reference izuzeci.

`AuthorRequest` Koristi enum RequestStatus za definisanje stanja zahteva, što čini kod čitljivijim.

`Comment` Omogućava hijerarhiju komentara (odnos roditelj-dete) kroz `ParentComment` i `ChildrenComments`. Povezuje komentar sa korisnikom i postom.

`Follower` Modeluje relaciju izmedju korisnika (ko prati i koga prati).

`Image` Centralizuje podatke o slici i povezuje ih sa postovima.

`Like` Omogućava modelovanje lajkova sa podrškom i za komentare i za postove. Korišćenje enum-a `LikeStatus` omogućava fleksibilnost u definisanju stanja (liked, disliked, null).

`Notification` Modeluje obaveštenja, čime se prati interakcija između korisnika (npr. komentari, lajkovi, praćenje).

`Post` Jasno povezuje post sa korisnikom, slikom, kategorijama, komentarima i lajkovima. Korišćenje kolekcija omogućava jednostavno navigiranje kroz povezane entitete.

`PostCategory`  Modeluje many-to-many relaciju između postova i kategorija. Ima logiku za soft delete i status aktivacije.

`Role` Jasno definiše ulogu korisnika i omogućava dodelu više korisnika jednoj ulozi.

`UseCaseLog` Omogućava praćenje izvršenih use-case-ova, što je korisno za audit i debagovanje.

`User` Modeluje korisnika sa svim bitnim informacijama, uključujući lične podatke, ulogu i povezane kolekcije (postovi, komentari, lajkovi, use-case logovi i odnose praćenja).

`UserUseCase` Povezuje korisnike sa use-case-ovima, što može biti korisno za praćenje dozvola ili audit akcija.



**Arhitektonska odluka i odvajanje odgovornosti:**

- Objasni da si podelio domenski sloj u više entiteta kako bi se enkapsulirala poslovna logika, omogućila jasna separacija između poslovnih pravila i tehničkih detalja (npr. perzistencije podataka).
- Istakni kako `BaseEntity` omogućava dosledno praćenje entiteta kroz sve klase.

**Upotreba enumeracija i validacija:**

- Naglasi upotrebu enum tipova (`RequestStatus`, `LikeStatus`, `NotificationType`) za poboljšanje čitljivosti koda i jasnije definisanje stanja.
- Objasni važnost validacija i ograničenja (bilo putem Data Annotations ili Fluent API-ja) za održavanje integriteta podataka.

**Navigaciona svojstva i relacije:**

- Objasni kako virtual svojstva omogućavaju EF Core-u da kreira relacije između entiteta, kao i podršku za Lazy Loading, što poboljšava performanse i olakšava rad sa podacima.
- Posebno istakni kompleksnije relacije, poput self-referencijalne veze u `Comment` klasi i many-to-many veze u `PostCategory`.

**Konvencije imenovanja:**

- Istakni da koristiš jasne i konzistentne konvencije (npr. `UserId` umesto `IdUser`) kako bi kod bio čitljiviji i lakši za održavanje.

**Odluke o nasleđivanju:**

- Diskutuj odluke zašto su neki entiteti nasledili `BaseEntity` dok neki nisu (npr. `Follower`, `UseCaseLog`) i koje su prednosti i mane takvog pristupa.

  **Prirodna jedinstvenost:**
  Composite ključevi, koji se sastoje od ključeva entiteta koje povezuju (npr. `FollowerId` i `FollowingId`), prirodno osiguravaju jedinstvenost veze. Na taj način se sprečava dupliranje istih veza bez potrebe za dodatnim primarnim ključem.

  **Jednostavnost modela:**
  Join entiteti često imaju samo dve (ili nekoliko) ključne informacije koje ih povezuju. Korišćenjem composite ključeva, model ostaje čist i usmeren na samo ono što je zaista važno za tu vezu.

  **Optimizacija baze:**
  Bez dodatnih kolona koje se retko koriste, tabela join entiteta ostaje manja i potencijalno brža u operacijama pretrage i povezivanja, što može biti prednost kod vrlo velikih količina podataka.

"U projektu smo se odlučili za pristup gde nisu svi join entiteti nasleđeni iz `BaseEntity`. Za entitete kao što su `Follower` i `UserUseCase` primenjen je pristup composite ključeva, jer ovi entiteti primarno služe za modelovanje many-to-many veza bez potrebe za dodatnim audit informacijama. Ovaj pristup omogućava jasniju i jednostavniju strukturu baze podataka, smanjujući broj nepotrebnih kolona i potencijalnu kompleksnost modela."

"Za entitete koji sadrže kompleksniju poslovnu logiku i gde je važno pratiti audit podatke, koristimo `BaseEntity` kako bismo osigurali konzistentan pristup praćenju promena, kreiranja i eventualnog soft delete-a. Primeri ovakvih entiteta su `Post`, `Comment` i drugi centralni entiteti aplikacije."



**Jasna separacija poslovne logike:** Kroz ovaj folder se jasno odvaja logika koja je specifična za problematiku aplikacije od drugih tehničkih aspekata, što omogućava da se promene u poslovnim pravilima implementiraju bez uticaja na ostatak sistema.

**Ponovna upotreba :** Budući da Domain folder sadrži čiste, poslovno orijentisane modele, lako ih je testirati u izolaciji. Takođe, oni se mogu koristiti u više delova aplikacije (npr. u API-ju, aplikacionoj logici).

**Jasna komunikacija koncepta:** Ovakav pristup pomaže timovima da se odmah vidi koja je srž aplikacije i kako su definisani glavni poslovni entiteti.



2. **<u>EFDataAccess</u>** Prestavlja most izmedju domenske logike (modela) i baze podataka. Ovaj sloj je odgovoran za pristup podacima. Koristi Entity Framework Core za komunikaciju sa bazom podataka (MS SQL Server). Tu se nalaze DbContext (glavna klasa za interakciju sa bazom podataka kroz EF), konfiguracije entiteta, migracije i sve ostalo vezano za perzistenciju podataka. 

   

   **Izolacija pristupa podacima:** Jasno odvajanjem pristupa podacima, omogućava se promena implementacije pristupa podacima bez uticaja na ostatak aplikacije. Na primer, ako se u budućnosti odluči za drugi ORM ili čak drugačiju bazu podataka, izmene se fokusiraju samo ovde.

   **Centralizovana konfiguracija:** Svi aspekti koji se tiču povezivanja sa bazom i konfiguracije entiteta su svedeni na jedno mesto, što olakšava održavanje i debugging.

   **Podrška za migracije:** Korišćenje EF Core migracija olakšava upravljanje verzijama baze podataka, što je posebno važno kod kontinuiranog razvoja i unapređenja.

   

   Koristi se **‚‚Code first”** pristup – Kreće se od koda, naprave se sve potrebne klase i njihove međusobne konekcije i jednom kada napravimo te klase pustićemo da nam alat od koda napravi celu bazu podataka.

   

   <u>EFDataAccess.csproj</u> => XML konfiguracija za projekat EFDataAccess.csproj koji definiše zavisnosti i podešavanja za projekat.

   ItemGroup sa PackageReference:
   Ovde se definišu paketi koji su potrebni za rad projekta. Svaki PackageReference definiše jedan NuGet paket koji je potreban

   ItemGroup sa ProjectReference:
   Ovde se definišu reference na druge projekte u rešenju. U ovom slučaju, postoji referenca na Domain projekat, što znači da EFDataAccess projekat zavisi od Domain projekta i može koristiti njegove entitete i druge resurse.

   

   Seeding podataka: **protected override void OnModelCreating(ModelBuilder modelBuilder)** 

   *override* => Znaci da je vec definisan metod u klasi DbContext, ali mi redefinisemo njegovo ponasanje.
   Ovo je virtualna metoda gde dodajem incijalne podatke, bazni početni podaci kao preduslov funkcionisanja aplikacije. Definisem kako ce entiteti biti mapirani u tabele u bazi podatka.

   ApplyConfiguration pozivima koristiš Fluent API konfiguracije koje si definisao u zasebnim klasama (npr. `PostConfiguration`, `CategoryConfiguration`, itd.). To omogućava da sve konfiguracije ostanu modularne i odvojene od same `DbContext` klase. U tim konfiguracijama postavljaš detalje poput primarnih ključeva, relacija, ograničenja, imena kolona i slično.
   

`modelBuilder.Entity<Post>().HasQueryFilter(x => !x.IsDeleted);`
   Ova linija definiše globalni filter upita za entitet Post u DbContext-u.
   Globalni filter upita je mehanizam koji omogućava da se automatski primeni filter prilikom izvršavanja upita nad određenim entitetom, čime se ograničava skup podataka koji se vraća iz baze podataka. 
   Konkretno, izraz `x => !x.IsDeleted` definiše uslov za filter. U ovom slučaju, uslov kaže da će se samo neizbrisani postovi uzimati u obzir prilikom izvršavanja upita.
   Ovo je korisno za implementaciju ‘soft delete‘ u bazi podataka.

`OnConfiguring(DbContextOptionsBuilder optionsBuilder)`

Prvo ulazim u SQL Management Studio, konektujem se, kopiram Server name u Server Explorer-u za dodavanje konekcije i izaberem 'Blog' bazu podataka pa kopiram connection string.



**SaveChanges()**
   Metoda `SaveChanges()` je ključna jer se poziva svaki put kada želiš da sačuvaš promene u bazi podataka. U tvom slučaju, override-uješ ovu metodu kako bi dodao dodatnu logiku pre nego što se promene upišu u bazu. 
   Evo šta se dešava: 

1-**Iteracija kroz promene (ChangeTracker):**
   `ChangeTracker` prati sve entitete koje si promenio u toku rada sa kontekstom. Prolaziš kroz sve te entitete.

2-Za svaki entitet proveravaš da li je tipa `BaseEntity`. Ovo je korisno jer su svi tvoji glavni entiteti koji treba da se auditiraju nasleđeni iz `BaseEntity`. Time se osigurava da svi entiteti dobiju zajednička svojstva kao što su `CreatedAt`, `ModifiedAt`, `IsActive` i `IsDeleted`.

3-**Postavljanje vrednosti na osnovu stanja:**

**EntityState.Added:**
   Kada se entitet dodaje, postavljaš:

`CreatedAt` na trenutno vreme.

`IsActive` na `true`, `IsDeleted` na `false`, i brišeš sve vrednosti koje se odnose na brisanje ili modifikaciju (`DeletedAt`, `ModifiedAt`).

Ovo osigurava da svaki novi entitet ima pravilno inicijalizovane vrednosti.

**EntityState.Modified:**
   Kada se entitet modifikuje, samo postavljaš `ModifiedAt` na trenutno vreme. Ovo je korisno za praćenje kada je poslednji put entitet izmenjen.

**Poziv osnovne implementacije:**
   Nakon što si izvršio ove pripremne radnje, pozivaš `base.SaveChanges()` da bi se promene zaista sačuvale u bazi



Da bi klasa bila tabela treba da napravimo polje specifičnog tipa, a taj tip je **DbSet<>** Između treba da bude ime klase koja će predstavljati našu tabelu.

`public DbSet<Blog> Blogs { get; set; }` Tabela će se zvati 'Blogs'

Svako DbSet svojstvo predstavlja entitet koji je definisan u domenskom sloju.









Pisanje Configurations folder u EF Core omogućava mi da konfigurišem kako će se entiteti mapirati na tabele u bazi podataka. Ove konfiguracije se koriste za definisanje ključeva, ograničenja, veza između entiteta i drugih detalja vezanih za mapiranje entiteta u bazu podataka.

HasMany, WithOne, HasForeignKey - Ove metode se koriste za definisanje relacija izmedju entiteta.

**HasMany:**
Koristi se za definisanje da jedan entitet (na primer, `User`) ima mnogo povezanih entiteta (na primer, `Posts`, `Comments`, `Likes` itd.).
Primer: builder.HasMany(x => x.Posts)
Ovime govoriš da svaki `User` može imati kolekciju `Posts`.

**WithOne:**
Nakon definisanja kolekcije sa `HasMany`, `WithOne` se koristi da navedeš referencu unutar povezanog entiteta koja pokazuje na "jedan" (jedinstvenu) stranu relacije.
Primer: .WithOne(y => y.User)
Ovo govori da svaki `Post` ima jednu referencu na `User` (tj. vlasnika posta).

**HasForeignKey:**
Ova metoda definiše koji će strani ključ (foreign key) biti korišćen u tabeli povezane strane.
Primer: .HasForeignKey(x => x.IdUser)
Ovime kažeš da kolona `IdUser` u tabeli `Posts` predstavlja strani ključ koji upućuje na primarni ključ u tabeli `Users`.

**OnDelete:**
Definiše ponašanje pri brisanju, tj. šta se dešava sa povezanim entitetima kada se entitet sa primarnim ključem izbriše.
**DeleteBehavior.NoAction:** Ova opcija znači da se pri brisanju roditeljskog entiteta neće izvršiti nikakva automatska akcija nad povezanim entitetima. Drugim rečima, odgovornost za brisanje ili održavanje integriteta ostaje na tebi (ili se oslanjaš na bazu da ne izvrši kasnije restrikciju).
Ostale opcije uključuju:
**Cascade:** Automatski briše sve povezane entitete (obično se koristi kada je to željeno ponašanje).
**SetNull:** Postavlja vrednost stranog ključa na `null` u povezanim entitetima, ali to zahteva da taj strani ključ bude nullable.
**Restrict:** Slično kao `NoAction`, sprečava brisanje ako postoje povezani entiteti.



HasIndex, IsUnique, IsRequired, HasMaxLength - Ove metode se koriste za definisanje svojstava kolona i njihovih ograničenja u bazi podataka.

**HasIndex:**
Koristi se da definiše indeks nad jednom ili više kolona, što može poboljšati performanse upita.
**IsUnique:**
Postavlja jedinstvenost indeksa, što znači da vrednost u toj koloni mora biti jedinstvena u celoj tabeli.
**IsRequired:**
Definiše da je kolona obavezna, odnosno da ne može imati `null` vrednost.
**HasMaxLength:**
Ova metoda postavlja maksimalnu dozvoljenu dužinu string vrednosti.



**HasKey:** Ova metoda se koristi za definisanje primarnog ključa entiteta.
Definiše jednu ili više kolona koje čine primarni ključ.
Primer sa composite ključem: builder.HasKey(x => new { x.IdPost, x.IdCategory });
Ovo govori da kombinacija `IdPost` i `IdCategory` čini jedinstveni identifikator za entitet `PostCategory`. Takav composite ključ se često koristi kod join entiteta gde nijedan pojedinačni atribut nije dovoljan da garantuje jedinstvenost veze.



Tvoja konfiguraciona klasa, na primer `UserConfiguration`, implementira interfejs `IEntityTypeConfiguration<User>`. Ovo je čista i modularna praksa za konfiguraciju entiteta.

**Šta radi IEntityTypeConfiguration<T>:**
Ovaj interfejs zahteva implementaciju metode `Configure`, u kojoj se prosleđuje `EntityTypeBuilder<T>`.
Unutar te metode definišeš sva pravila mapiranja za entitet `User` – svojstva, indekse, relacije, ograničenja, itd.
Ovo omogućava da se konfiguracija entiteta održi odvojeno od samog `DbContext`-a, što poboljšava čitljivost i održavanje koda.

Kroz ove konfiguracije, Entity Framework Core tačno zna kako da mapira tvoje domenske klase na odgovarajuće tabele u bazi, kako da osigura integritet podataka i kako da optimizuje upite.








Kada je sve spremno treba da primenim migracije.
`dotnet ef migrations add initial migration`
Analizirati migraciju, ako je sve dobro onda radim:
`dotnet ef database update`



















2. **<u>Application</u>** Ovaj sloj orkestrira operacije između Domain sloja i ostalih tehničkih slojeva. Sadrži servisne interfejse, logiku poslovnih operacija, komandno-upitne (CQRS) modele, i slično. On definiše interfejse koje će ostali slojevi (kao Implementation) implementirati.
   Definiše šta je naša aplikacija sposobna da uradi, ali ne i način.
   Application sloj zavisi od Domain projekta i može koristiti njegove entitete i druge resurse. Application sloj ne treba da ima referencu ka EFDataAccess-u. 

   Interfejsom definišem metod, kažem šta može da uradi, ali ne na koji način, to ostavljam njegovim podklasama i ovaj deo zovemo Application.

   Ovde delim sistem na 2 vrste akcija. Korisnici sistema će pokušati da promene stanje stistema (commands) ili tražiti nešto od našeg sistema (queries).

   Ovaj princip se zove **CQS (Command Query Separation)**. 
   I komanda i query su use case-ovi. Cilj je da imam zajednički nadtip za sve komande i zajednički nadtip za sve query-e.

   

   Kad organizujem sistem, treba da logujem svaki query koji je iko ikada pokušao da uradi. Ali ne tražim svaku liniju u kontroleru. 
   Definišem interfejs **IUseCase**. Svaki slučaj korišćenja će imati svoj Id i Name. Upotrebom ovog interfejsa na nivou interakcije sa korisnikom pravim automatizam da zabranim izvršavanje nekog use case-a. Napraviću tabelu UserUseCases koja će imati IdUser u sebi i onda ću po broju znati doslovno svaki use case koji korisnik sme da izvrši.
   Obezbeđujem autorizaciju gde jednim ID-em na jednom mestu za svaku moguću aplikaciju u sistemu proveravam da li trenutno ulogovani korisnik sme ili ne sme da izvrši komandu. 
   
   

Svaki use case (odnosno operacija u aplikaciji) treba da ima jedinstveni identifikator i ime. Ovo omogućava da se kasnije lako referencira i prepoznaje konkretan use case. Na primer, use case za kreiranje posta ili ažuriranje korisnika.





Ovaj generički parametar definiše šta je od podataka neophodno da bi mogli da izvršimo komandu. Ukazuje na klasu ili tip podatka. Uvek nešto menja u sistemu, nikad ne vraćamo ništa – void.

`ICommand<TRequest>` Ovaj interfejs predstavlja operacije koje menjaju stanje sistema (npr. kreiranje, ažuriranje, brisanje). Metoda `Execute` prima podatke (request) koji su potrebni za izvršenje operacije. Korišćenjem generičkog tipa (`TRequest`) omogućava se fleksibilnost, jer svaki konkretan command može zahtevati drugačiji skup podataka.

void Execute(TRequest request);



Upit može da ima ulazne parametre, a izlaz svakako ima. Imaće 2 generička tipa (1 objekat za potencijalnu pretragu).Prvi generički tip ukazuje šta je rezultat pretrage, a drugi koji je ulazni parametar. Ne menja ništa u sistemu, vraćamo klijentu rezultat kroz sistem.

`IQuery<TResponse, TSearch>` Slično kao command, query interfejs se koristi za operacije čitanja podataka. Ovde metoda `Execute` prima neki tip pretrage ili filtera (`TSearch`) i vraća rezultat tipa `TResponse`. Time se jasno razdvaja operacija koja ne menja stanje (čitanje) od operacija koje menjaju stanje (komande).

TResponse Execute(TSearch search);



**Zaduženja UseCaseExecutor-a:**

UseCaseExecutor je centralizovana klasa koja pre izvršenja use case-a obavlja logovanje i proveru da li je trenutni actor ovlašćen da izvrši zadatu operaciju. Ovo je odličan primer primene principa separation of concerns, jer eliminiše potrebu da svaki use case pojedinačno implementira logiku autorizacije i logovanja.

1. **Logging:**
   Pre izvršenja bilo koje operacije (bilo komande ili upita), executor poziva `_logger.Log` metodu. Time se beleži koji use case se izvršava, ko ga pokreće (koji actor) i koji podaci se prosleđuju. Ovo je vrlo korisno za audit i praćenje aktivnosti u sistemu.
2. **Autorizacija:**
   Pre nego što se izvrši komanda ili upit, proverava se da li trenutni actor ima dozvolu da izvrši taj use case. Ako actor nema odgovarajuću dozvolu (npr. na osnovu svog ID-ja koji je deo liste dozvoljenih use case ID-jeva), baca se `UnauthorizedUseCaseException`. Time se osigurava da samo autorizovani korisnici mogu da izvrše određene operacije.
3. **Izvršenje use case-a:**
   Ako su logovanje i autorizacija uspešno prošli, executor poziva metodu `Execute` na prosleđenom use case-u. Kod komandi, izvršava se `command.Execute(data)`, a kod upita se vraća rezultat `query.Execute(data)`.

**Centralizovana kontrola:** Svi use case-ovi prolaze kroz jedan executor, što omogućava da lako dodaješ cross-cutting concerns poput logovanja i autorizacije.

**Separation of Concerns:** Sama implementacija pojedinačnih use case-ova (komandi i upita) ostaje čista i fokusirana na poslovnu logiku, dok se administrativne zadatke (autorizacija, logovanje) delegiraju UseCaseExecutor-u.



Ključno da bismo napravili automatizam u smislu izvršavanja use case-ova jeste da imamo 1 niz integer-a **AllowedUseCases** (niz brojeva koji označavaju šta trenutni korisnik u aplikaciji sme da izvrši). 
Primer: Korisnik sa Id-em 2 sme da izvrši use case 4(kreiranje komentara), a ako pokuša da izvrši use case 7(kreiranje korisnika) onda sistem treba da ga odbije.



IUseCaseLogger
Interfejs koji omogućava beleženje informacija o svakom izvršenom use case-u.
Možeš implementirati ovaj interfejs kako bi snimao logove u bazu podataka, fajl ili neki drugi mehanizam za evidenciju događaja, što je korisno za audit i kasniju analizu.
Belezicu informacije u tabelu UseCaseLogs.

IApplicationActor
Ovaj interfejs predstavlja korisnika ili entitet koji izvršava određene akcije u sistemu.
Ovo ce biti korisnik koga  kasnije treba implementirati upotrebom sesija ili JWT-a.
**Id:** Jedinstveni identifikator aktora.
**Identity:** Tekstualna reprezentacija identiteta (npr. korisničko ime, email, itd.).
**AllowedUseCases:** Lista ID-jeva use case-ova koje actor ima dozvolu da izvrši. Ovo se koristi u UseCaseExecutor-u za autorizaciju.

UseCaseEnum
**Svrha:**
Sadrži sve definisane use case ID-jeve. Ovo omogućava da se u UseCaseExecutor-u, prilikom autorizacije, jednostavno poredi ID komande/upita sa listom dozvoljenih use case-ova aktora.
**Prednosti:**
Omogućava centralizovano upravljanje use case-ovima, što olakšava održavanje i kasnije dodavanje novih operacija u sistem.



Instanca klase UseCaseExecutor implemenitra logiku koja orkestrira izvrsenje use case ova (komandi i upita), ona:

- **Preuzima zahteve** (bilo da je reč o komandi ili query-ju) iz API sloja,
- **Izvršava logovanje** tako što beleži informacije o use case-u, aktoru koji ga izvršava i podacima koji se prosleđuju,
- **Proverava autorizaciju** – da li aktor ima dozvolu da izvrši taj konkretan use case,
- **Delegira izvršenje** stvarnom use case-ovu (pozivajući metodu `Execute` na tom objektu).

Dakle, taj "objekat" (instanca UseCaseExecutor-a) se ponaša kao middleware koji se nalazi između API-ja i poslovne logike, osiguravajući da se pre izvršenja zahteva obave neophodni koraci kao što su logovanje i autorizacija.



```
public void ExecuteCommand<TRequest>(ICommand<TRequest> command, TRequest data)
```

Ova metoda je generička i služi za izvršenje **komandi** – operacija koje menjaju stanje sistema (npr. kreiranje novog posta, ažuriranje korisničkih podataka, brisanje komentara, itd.).

**ICommand<TRequest> command:**
Ovo je konkretna instanca komande koja implementira interfejs `ICommand<TRequest>`. Taj interfejs, kao što smo ranije videli, nasledjuje `IUseCase` i ima metodu `Execute(TRequest request)`. Komanda sadrži sve neophodne poslovne logike za izvršenje operacije.

**TRequest data:**
Ovo su podaci koji su potrebni za izvršenje komande. Na primer, u komandi za kreiranje posta, to bi mogli biti detalji novog posta (naslov, sadržaj, id korisnika, itd.).



```
public TResponse ExecuteQuery<TResponse, TSearch>(IQuery<TResponse, TSearch> query, TSearch data)
```

Ova metoda je generička za izvršenje **upita** – operacija koje samo čitaju podatke iz sistema i ne menjaju njegovo stanje (npr. dohvatanje liste postova, korisničkih podataka, komentara, itd.).

**IQuery<TResponse, TSearch> query:** 
Ovo je konkretna instanca upita koja implementira interfejs `IQuery<TResponse, TSearch>`. Ovaj interfejs nasleđuje `IUseCase` i ima metodu `Execute(TSearch search)` koja vraća rezultat tipa `TResponse`.

**TSearch data:**
Ovo su kriterijumi pretrage ili filteri potrebni za izvršenje upita. Na primer, kod upita za dohvatanje postova, ovo mogu biti parametri za filtriranje (kao što su kategorija, autor, datum, itd.).



Ova arhitektura se često koristi u čistoj arhitekturi (Clean Architecture) i CQRS (Command Query Responsibility Segregation) pristupima, gde se jasno razdvajaju operacije koje menjaju stanje sistema od onih koje samo čitaju podatke, a dodatno se uvodi mehanizam za logovanje i autorizaciju kao cross-cutting concern.





Pravim foldere **Commands, Queries, Searches i DataTransfer. 
** Pravljenje **DTO**-ova (Data Transfer Objects) u Application sloju ima nekoliko koristi i ciljeva.

1. Prenos podataka između različitih slojeva čime se izbegava direktno korišćenje domenskih modela ili entiteta iz baze.
2. Omogućavaju očuvanje granularnosti i abstrakcije u aplikaciji. 
3. Aplikacija postaje fleksibilnija i manje zavisna od implementacija u drugim slojevima.
4. **Jasnoća i konzistentnost:**
   DTO-ovi omogućavaju da jasno definišeš šta se prenosi između slojeva. Time postaje jasna struktura podataka koja se očekuje na ulazu i izlazu, što olakšava održavanje koda.
5. **Fleksibilnost u razvoju:**
   Kada se DTO-ovi koriste, lako je dodavati ili uklanjati polja u komunikaciji između slojeva, bez potrebe za direktnom modifikacijom domen modela. Ovo omogućava evoluciju API-ja bez potrebe da se utiče na poslovnu logiku.









Komande u application sloju su ključne za realizaciju *Command Query Responsibility Segregation* (CQRS) obrasca, ali se mogu koristiti i u klasičnijim arhitekturama za jasno razdvajanje zadataka, poboljšanje održivosti koda i poštovanje SOLID principa. Evo detaljnog pregleda:

**Izolacija logike**: Aplikacioni sloj izoluje business logiku od vanjskih interfejsa i infrastrukture. Time se omogućava lakša modifikacija, testiranje i održavanje koda.

**Koordinacija radnji**: Ovaj sloj se brine za pozivanje odgovarajućih servisa, validaciju ulaznih podataka, transakciono upravljanje, logovanje i rukovanje greškama.

**Komandni Obrazac (Command Pattern)**
Komandni obrazac omogućava enkapsulaciju svih informacija potrebnih za izvršavanje neke radnje. U kontekstu tvojih interfejsa:
**Interfejsi poput `ICommand<T>`**: Oni predstavljaju generički interfejs, gde `T` predstavlja DTO (Data Transfer Object) koji sadrži sve potrebne podatke za izvršenje komande. Na primer, `UpsertAuthorRequestDto` u `ICreateAuthorRequestCommand` ili `ICreateUserCommand`.
**Razdvajanje odgovornosti**: Svaka komanda ima specifičnu odgovornost, što čini kod čistijim i testabilnijim. Na primer, komanda za kreiranje korisnika se ne meša sa komandom za ažuriranje ili brisanje.

**Razdvajanje odgovornosti (Separation of Concerns):** Svaka komanda obavlja jednu specifičnu radnju, što povećava čitljivost i održivost koda.



Ovi fajlovi definišu interfejse za komande (commands) u aplikaciji koja koristi **CQRS (Command Query Responsibility Segregation)** obrazac. Komande predstavljaju operacije koje menjaju stanje sistema (kreiranje, ažuriranje, brisanje podataka).

ICreateAuthorRequestCommand

Definiše komandu za kreiranje zahteva za autora.

Nasleđuje **ICommand** sa generičkim parametrom **UpsertAuthorRequestDto**, koji verovatno sadrži podatke potrebne za kreiranje/autorizaciju autora.

 **IUpdateAuthorRequestCommand**

- Služi za ažuriranje zahteva za autora.
- Koristi isti **DTO** (`UpsertAuthorRequestDto`), što sugeriše da može sadržati podatke kao što su ime autora, opis ili neki status.



ICreateCommentCommand

Definiše komandu za kreiranje komentara.

Nasleđuje **IAsyncCommand**, što znači da se verovatno izvršava asinhrono.

Koristi **UpsertCommentDto** kao podatke koji se prosleđuju (verovatno sadrži sadržaj komentara, ID posta na koji se odnosi itd.). 

IDeleteCommentCommand

Komanda za brisanje komentara na osnovu njegovog **ID-a** (koristi `int` kao parametar).

Nasleđuje **ICommand<int>**, što znači da prima samo ID komentara koji treba obrisati.

IDeletePersonalCommentCommand

Slično **IDeleteCommentCommand**, ali verovatno služi za brisanje komentara samo od strane njihovog autora (lični komentari).

Takođe prima samo **int ID komentara**.

IUpdatePersonalCommentCommand
Definiše komandu za ažuriranje komentara koji pripadaju korisniku.

Koristi **UpsertCommentDto**, što znači da može ažurirati sadržaj komentara.



Sta su Queries?

Queries su komponente koje se koriste za čitanje podataka iz sistema. One se razlikuju od komandi (Commands) po tome što:

- **Ne menjaju stanje**: Cilj im je samo da povuku podatke, bez uticaja na stanje aplikacije.
- **Čisto čitanje**: Implementacija queries omogućava optimizaciju pristupa podacima, često se primenjuju cache strategije, optimizovani SQL upiti, itd.

Struktura Query interfejsa: Ovi interfejsi generalno imaju generičke parametre koji definišu:

- **Prvi parametar**: Tip odgovora koji se očekuje (na primer, DTO za pojedinačni entitet ili pak paginirani odgovor).
- **Drugi parametar**: Tip ulaznog parametra koji se koristi za filtriranje ili pretragu (npr. `AuthorRequestSearch`, `CommentSearch`, `UserSearch`).

Ova struktura omogućava da se jasno odvoji logika pretrage i filtriranja od načina na koji se podaci vraćaju korisniku.



**Očuvanje čistoće arhitekture**: Razdvajanjem upita od komandi, smanjuje se kompleksnost i omogućava lakše testiranje.





IGetPostQuery

- Ovaj upit dobavlja **detalje jednog posta**.

- Nasleđuje `IQuery<GetPostDetailsDto, int>`

  , što znači:

  - Prima **int** kao parametar (verovatno ID posta).
  - Vraća **GetPostDetailsDto**, koji sadrži detaljne informacije o postu (naslov, sadržaj, autor, datum kreiranja itd.).

🔹 **Primer korišćenja:**
Kada korisnik klikne na određeni post, frontend može koristiti ovaj query da dobavi njegove detalje.



IGetPostsQuery

- Ovaj upit dobavlja **listu postova**, ali uz paginaciju i filtriranje.

- Nasleđuje `IQuery<PagedResponse<GetPostsDto>, PostSearch>`

  , što znači:

  - **Ulazni parametar:** `PostSearch` – objekat koji verovatno sadrži kriterijume pretrage (npr. ključne reči, autora, kategoriju, datum itd.).

  - Povratna vrednost:

    PagedResponse<GetPostsDto> – kolekcija postova u paginiranom formatu.

    - `GetPostsDto` verovatno sadrži osnovne informacije o svakom postu (ID, naslov, kratak opis itd.).
    - `PagedResponse<T>` je generička klasa koja sadrži podatke o broju stranica, ukupnom broju rezultata itd.

🔹 **Primer korišćenja:**
Na stranici sa listom postova frontend može pozvati ovaj query sa određenim filterima i paginacijom (npr. "Prikaži 10 postova po stranici").



ICheckFollowStatusQuery

- Ovaj upit proverava **da li jedan korisnik prati drugog korisnika**.

- Nasleđuje `IQuery<bool, int>`

  , što znači:

  - Prima **int** kao parametar (verovatno ID korisnika kojeg proveravamo).
  - Vraća **bool** (true = korisnik prati, false = korisnik ne prati).

🔹 **Primer korišćenja:**
Ako korisnik poseti profil drugog korisnika, frontend može pozvati ovaj query da prikaže dugme:

- **"Prati"**, ako korisnik još ne prati ovu osobu.
- **"Otprati"**, ako već prati.

Ovi Query interfejsi služe za dohvat podataka u skladu sa **CQRS principom**:







Sta su Searches?

Searches (ili Search DTO-ovi) su objekti koji se koriste za prenos kriterijuma pretrage i filtriranja podataka. U tvom primeru imamo:

- `AuthorRequestSearch : PagedSearch` koji sadrži dodatni parametar `Reason`.
- `CommentSearch : PagedSearch` koji sadrži parametar `Username`.



**Fleksibilnost u filtriranju**: Omogućavaju korisnicima da precizno definišu koje podatke žele da vide (npr. filtriranje komentara po username-u).

**Centralizovana logika pretrage**: Svi kriterijumi pretrage se enkapsuliraju u jedan objekat, što olakšava proširenje i modifikaciju logike pretrage u budućnosti.

**Optimizovao performanse**: Vraćanje samo određenog broja zapisa (na osnovu `ItemsPerPage` i `CurrentPage`) smanjuje opterećenje na mrežu i brže omogućava korisniku pristup relevantnim podacima.









PagedResponse<T>
**PageCount**: Ovo je izračunato svojstvo koje pokazuje ukupan broj stranica. Formula koristi `Math.Ceiling` da bi se zaokružilo na sledeći ceo broj, što je važno kada broj zapisa nije deljiv sa `ItemsPerPage`. Na primer, ako imaš 101 zapis sa 10 elemenata po stranici, `PageCount` će biti 11, jer će poslednja stranica imati samo 1 element.

**Items**: Kolekcija zapisa tipa `T` koji se vraćaju kao rezultat upita. Ovo su zapravo podaci koji će biti prikazani korisniku za trenutnu stranicu.







Klasa **PagedSearch** je apstraktna klasa koja služi kao bazna klasa za sve pretrage (search DTO-ove) koje uključuju paginaciju. Ona definiše osnovne parametre za paginaciju:

Centralizacija paginacionih parametara:

Umesto da svaki *Search* DTO implementira svoje paginacione parametre, PagedSearch omogućava da se ti parametri definisu jednom, a zatim nasleđuju u svim specifičnim pretragama. Na primer, klase kao što su `AuthorRequestSearch` ili `CommentSearch` nasleđuju **PagedSearch** i automatski imaju `PerPage` i `Page` parametre. Ovo je vrlo korisno jer:

- **DRY princip (Don't Repeat Yourself):** Smanjuješ dupliranje koda, jer ne moraš svaki put da definišeš ove osnovne parametre.
- **Konzistentnost:** Svi upiti koji koriste paginaciju imaju isti početni podrazumevani broj stavki po stranici i inicijalnu stranicu.









**INotificationService** je servis koji se primarno bavi **kreiranjem (i verovatno i čuvanjem)** notifikacija. Evo nekoliko ključnih tačaka:

**Kreiranje notifikacije:** Metoda `CreateNotification` prima DTO (Data Transfer Object) `InsertNotificationDto` koji verovatno sadrži sve potrebne podatke (kao što su tekst, korisnik kojem je namenjena, tip notifikacije, itd.) da bi se kreirala notifikacija.

Business logika:** U suštini, ovaj servis upravlja logikom notifikacija unutar tvoje aplikacije, ali ne mora nužno da se bavi njihovim slanjem u realnom vremenu.

**Encapsulacija kreiranja notifikacija:** Služi kao centralno mesto za sve operacije vezane za kreiranje i čuvanje notifikacija.







**INotificationHubService** se bavi **slanjem notifikacija u realnom vremenu**, što ukazuje na to da se verovatno oslanja na tehnologije poput SignalR-a ili sličnih mehanizama za push notifikacije. Ključne tačke su:

**Slanje notifikacije pojedinačnim korisnicima:** Metoda `SendNotificationToUser` omogućava slanje notifikacije direktno određenom korisniku, što može biti korisno za personalizovane obaveštenja.
**Broadcasting poruka:** Metoda `BroadcastMessage` omogućava slanje poruke svim korisnicima ili određenoj grupi korisnika, što je korisno kada želiš da obavestiš sve korisnike o nekoj globalnoj promeni ili obaveštenju.
**Asinhroni rad:** Oba metoda su asinhrona (vraćaju `Task`), što je uobičajeno kod operacija koje komuniciraju preko mreže ili sa hub servisima, kako bi se osiguralo da se ne blokira izvršenje niti dok se poruka šalje.

**Real-time komunikacija:** Omogućava tvojoj aplikaciji da komunicira sa klijentima u realnom vremenu, što je često neophodno za moderne aplikacije koje zahtevaju instant obaveštenja.

Decoupling (razdvajanje): Korišćenje posebnog servisa za hub komunikaciju pomaže u odvojenju poslovne logike (kreiranje notifikacija) od transportnog mehanizma (slanje notifikacija), što olakšava održavanje i eventualno testiranje.

**INotificationService** je fokusiran na logiku kreiranja i čuvanja notifikacija, dok **INotificationHubService** upravlja slanjem tih notifikacija ili poruka u realnom vremenu.













U .NET svetu, **`Exception`** je osnovna (base) klasa za sve greške i izuzetke. Kada se dogodi greška ili nevažeća operacija, uobičajeno je baciti (throw) instancu klase koja nasleđuje `Exception`. Ovo omogućava da se greške propagiraju kroz aplikaciju, da se loguju, hendluju ili proslede dalje (npr. korisničkom interfejsu) na centralizovan način.

**Poruka greške:** Svaki `Exception` nosi poruku koja opisuje šta je pošlo po zlu.

**Stack Trace:** Omogućava praćenje toka izvršavanja koji je doveo do greške.

**Nasleđivanje:** Možeš kreirati sopstvene (custom) izuzetke tako što nasleđuješ `Exception` klasu, što je upravo ono što radimo ovde.


UnauthorizedUseCaseException

Ovaj izuzetak se baca kada korisnik (predstavljen preko `IApplicationActor`) pokuša da izvrši neku upotrebu slučaja (use case) za koji nema dozvolu.

Konstruktor prima i `IUseCase` (koji verovatno sadrži informacije o akciji koju pokušava da izvrši) i `IApplicationActor` da bi se kreirala detaljna poruka o grešci.



Ovaj pristup omogućava centralizovano rukovanje greškama, što je dobro za održavanje, debagovanje i obezbeđivanje sigurnosnih mera.



**UnauthorizedUseCaseException** pokriva generalnu autorizaciju za izvršavanje UseCase-a. Proverava da li korisnik uopšte ima dozvolu da koristi određenu komandu.

**UnauthorizedUserAccessException** služi za specifične situacije unutar samog UseCase-a, gde korisnik možda ima pravo da izvrši komandu, ali nema pravo da menja određeni entitet (npr. može da briše komentare, ali ne komentare drugih korisnika).



















2. **<u>Implementation</u>**  Ovaj sloj pruža konkretne implementacije servisa ili interfejsa definisanih u Application sloju. Ovde se nalaze specifične poslovne logike, integracije sa eksternim servisima, validacije (npr. FluentValidation) i ostali detalji koji su specifični za datu implementaciju.

Upravljanje izuzecima uvek radi sloj iznad (znači API ili Desktop).



**EFDatabaseLogger** je klasa koja implementira interfejs **IUseCaseLogger**. Njen osnovni zadatak je da evidentira (loguje) izvršavanje određenih use case-ova u aplikaciji tako što upisuje odgovarajuće podatke u bazu podataka pomoću Entity Framework-a (EF). Ovakav pristup omogućava centralizovanu evidenciju aktivnosti u sistemu.

Korišćenje dependency injection
Klasa prima instancu **BlogContext** putem konstruktora:

Ovo je primer **dependency injection** (DI), gde se kontekst baze podataka ubacuje u klasu, što doprinosi boljoj testabilnosti i fleksibilnosti koda. Umesto da sama kreira instancu konteksta, klasa dobija već inicijalizovan kontekst od strane DI kontejnera, što omogućava lakšu zamenu ili lažiranje tokom testiranja.

Single Responsibility Principle SRP – Klasa mora da ima 1 razlog što se menja

Metoda `Log` prihvata tri parametra:

- **IUseCase useCase**: Informacije o izvršenom use case-u.
- **IApplicationActor actor**: Informacije o entitetu (korisniku ili sistemskom akteru) koji je pokrenuo use case.
- **object data**: Dodatni podaci koje želimo da zabeležimo (na primer, ulazne vrednosti, rezultate, itd.).

Unutar metode, klasa kreira novi objekat tipa **UseCaseLog** i popunjava ga sledećim informacijama: Date, Actor, Data (JSON), UseCaseName

Nakon toga, objekat se dodaje u kolekciju **UseCaseLogs**:

Na kraju, poziva se `_context.SaveChanges();` što sinhrono upisuje promene u bazu podataka.

Iako je trenutno implementacija sinhrona, za aplikacije sa visokim opterećenjem ili gde je performans važan, preporučljivo je koristiti asinhrono snimanje.





Ovaj kod predstavlja statičku klasu **UseCaseExtension** koja sadrži ekstenziju metode za klasu **User**. Njena svrha je da ažurira dozvoljene use case-ove (dozvole ili akcije koje korisnik može da izvrši) u bazi podataka, u zavisnosti od uloge korisnika (Admin, Author ili User).

**Statistička klasa:** Definisana je kao statička, što znači da se svi članovi (u ovom slučaju metoda) ne vezuju za instancu klase. Ovo je tipično kada pravimo ekstenzije.

**Ekstenziona metoda:** Metod **UpdateUseCasesForRole** je ekstenziona metoda za klasu **User**. To znači da se može pozvati direktno na instanci tipa `User` kao da je njen član (npr. `user.UpdateUseCasesForRole(context)`). Prvi parametar metode (sa ključnom reči `this`) označava na koji tip se ekstenzija vezuje.

`var currentUseCaseIds`
Ova linija koda preuzima sve trenutne use case-ove (dozvole/akcije) koje korisnik ima, koristeći `BlogContext` za pristup tabeli **UserUseCases**.
Rezultat se pretvara u **HashSet<int>** radi brze provere da li neki element postoji, što je korisno prilikom daljih operacija nad skupovima.

`var newUseCases = user.IdRole switch{}`
Ovde se koristi **switch expression** (izraz `switch`) na `user.IdRole`, što znači da se za svaku ulogu (Admin, Author, User) definiše drugačiji skup dozvoljenih use case-ova.
Svaki skup se kreira kao **HashSet<int>** koji sadrži ID-jeve dozvoljenih use case-ova. Ovi ID-jevi se dobijaju kastovanjem enumeracije **UseCaseEnum** na `int`.



`var useCasesToAdd`
Iz skupa novih use case-ova se filtriraju oni koji korisnik trenutno nema (tj. oni koji nisu prisutni u `currentUseCaseIds`).
Za svaki takav use case ID, kreira se novi objekat tipa **UserUseCase** koji povezuje korisnika sa tim use case-om.
Ako postoji bar jedan use case koji treba dodati (`useCasesToAdd.Any()`), koristi se `AddRange` metoda da se svi novi zapisi dodaju u kolekciju.



`var useCasesToRemove`
Ova logika pronalazi sve use case-ove (u tabeli **UserUseCases**) koji su trenutno dodeljeni korisniku, ali se ne nalaze u novom skupu dozvoljenih use case-ova.
Ako postoji bar jedan takav zapis, koristi se `RemoveRange` metoda da se oni uklone iz baze.



Metoda **UpdateUseCasesForRole** omogućava dinamičko ažuriranje dozvola korisnika u skladu sa njihovom ulogom. Preko efikasne manipulacije skupovima (dodavanje novih i uklanjanje starih zapisa), osigurava se da korisnik ima tačno one use case-ove koje treba, a koji su definisani na osnovu njegove uloge (Admin, Author ili User). 















CreateNotification metoda obavlja sledeće korake:
-Prvo se poziva `GenerateNotificationLink(dto)` da bi se postavio odgovarajući link u DTO objektu. Time se osigurava da notifikacija sadrži direktan URL koji vodi do relevantne stranice (post, komentar, itd.).
-Kreira se novi objekat tipa **Notification** i popunjava se sa podacima iz DTO-a:
-Notifikacija se dodaje u kolekciju **Notifications** unutar EF konteksta i snima se u bazu podataka.
-Nakon što je notifikacija sačuvana, poziva se metoda `_notificationHubService.SendNotificationToUser(dto.IdUser, dto)`.
Ovim se korisnik obaveštava u realnom vremenu o novoj notifikaciji. Servis verovatno koristi tehnologiju kao što je SignalR za push notifikacije ka klijentskoj aplikaciji.



Unutar API projekta

  <PackageReference Include="Microsoft.AspNetCore.SignalR.Common" Version="8.0.8" />

Ovo je prilično kompletan sistem za upravljanje notifikacijama u ASP.NET aplikaciji koristeći **Entity Framework (EF)** za upravljanje podacima i **SignalR** za real-time obaveštenja. Razdvojiću objašnjenje u dve glavne celine:

1. **Objašnjenje dva fajla koje si prvo poslao**
2. **Pregled celokupnog sistema notifikacija**

EFCreateNotificationCommand

Ovo je **Command handler** (komanda) koji kreira notifikaciju.
➡️ Koristi **INotificationService** da delegira kreiranje notifikacije.
➡️ Automatski postavlja `IdUser` tako da odgovara trenutnom korisniku (`_actor.Id`).

📌 **Zašto koristimo INotificationService?**

- Umesto direktnog zapisivanja u bazu, koristimo **servis** (NotificationService) koji sadrži logiku za dodavanje notifikacija.
- Na taj način imamo bolju separaciju koda i testabilnost.



📄 **EFMarkAllNotificationsAsReadCommand**

Ova komanda **označava sve notifikacije korisnika kao pročitane**.
➡️ Prvo dohvaća **sve nepročitane notifikacije** za korisnika iz baze.
➡️ Menja status `IsRead = true`.
➡️ **Poziva `_context.SaveChanges()`** da trajno sačuva promene u bazi.

📌 **Potencijalni problemi?**

- Ako korisnik ima **previše nepročitanih notifikacija**, ovo može izazvati probleme sa **performansama**. Bolji pristup bi bio da koristimo **batch update** u EF Core-u:

_context.Notifications
    .Where(n => n.IdUser == IdUser && !n.IsRead)
    .Update(n => new Notification { IsRead = true });

**Koristi "bulk update" za optimizaciju**

- Umesto da ažurira notifikacije jednu po jednu, koristi **EF Core BulkExtensions** (`_context.BulkUpdate(notifications)`).
- Ovo poboljšava performanse kada korisnik ima veliki broj nepročitanih notifikacija.

**Brže izvršavanje** – Bulk operacije koriste optimizovane SQL upite umesto pojedinačnih `UPDATE` komandi za svaku notifikaciju.



Sistem za notifikacije ovde se sastoji iz **više slojeva**, što omogućava bolju organizaciju i razdvajanje odgovornosti.

🔷 **1. Kreiranje notifikacija**
🔷 **2. Slanje real-time notifikacija pomoću SignalR-a**
🔷 **3. Obeležavanje kao pročitano**

NotificationService.cs
Metoda `GenerateNotificationLink`
Ova metoda generiše link koji će biti prikađen korisniku kada klikne na notifikaciju. Link zavisi od tipa notifikacije.
Koristi se moderan switch expression, što čini kod čitljivijim i sažetijim. Na osnovu vrednosti `dto.Type` (koja je tipa **NotificationType**), metoda vraća odgovarajući URL.
Ovakav pristup omogućava centralizovanu logiku kreiranja linkova, što olakšava kasniju izmenu ukoliko se logika promijeni.

🔹 **Kako ovo funkcioniše?**
1️⃣ **Generiše link** za notifikaciju na osnovu tipa (`GenerateNotificationLink`).
2️⃣ **Kreira objekat notifikacije** i upisuje ga u bazu.
3️⃣ **Obaveštava SignalR hub** da pošalje real-time notifikaciju korisniku.

📌 **Zašto koristimo interfejs `INotificationHubService`?**
➡️ Zato što želimo da logika **kreiranja notifikacije** i **slanja preko SignalR-a** budu razdvojene, što olakšava testiranje.



### **🔹 SignalR - Slanje real-time notifikacija**

📄 **SignalRNotificationHub.cs**

- `SendNotificationToUser(int idUser, object notification)` – šalje notifikaciju jednom korisniku.

SignalR omogućava real-time slanje preko **WebSockets-a** ili fallback-ova ako nisu podržani.







 **SignalR Hub - Povezivanje korisnika**

📄 **NotificationHub.cs**

Ovaj fajl definiše **WebSocket kanal** za slanje real-time notifikacija.


SendNotification - **Šalje privatnu notifikaciju** samo jednom korisniku (`idUser`).

SignalR prepoznaje korisnika pomoću `Clients.User(idUser)`, što radi jer imamo `CustomUserIdProvider`.



Kada korisnik otvori aplikaciju, poziva `JoinGroup(idUser)` da bi se **pridružio SignalR grupi**.

Dodaje korisnika u grupu sa imenom njegovog `idUser`.

Ovo omogućava da se korisniku mogu slati notifikacije i kada nije aktivno povezan.

Kada korisnik otvori više tabova ili koristi više uređaja, svi njegovi konekcije će biti deo iste grupe.



*SendNotificationToUser* - Prvo dodaje korisnika u grupu (mada ovo možda nije potrebno jer je već dodat).

Šalje poruku **svim konekcijama korisnika**, čak i ako koristi više uređaja/tabova.




Kada server treba da pošalje notifikaciju, koristi `SendNotificationToUser` ili `Clients.User(idUser).SendAsync(...)`.






CustomUserIdProvider.cs

Ovaj fajl je važan deo SignalR sistema jer definiše kako se korisnici prepoznaju unutar WebSocket konekcija.

 **Šta radi ovaj kod?**

- Kada korisnik uspostavi WebSocket vezu sa `NotificationHub`, ovaj `UserIdProvider` će izvući njegov **IdUser** iz `Claims` (JWT tokena ili kolačića).
- Ova vrednost (`IdUser`) se koristi u SignalR za slanje notifikacija određenom korisniku pomoću `Clients.User(idUser.ToString())`.

 **Zašto nam je ovo potrebno?**

- SignalR nativno ne zna koji je ID korisnika kada se poveže.
- Ovim kodom osiguravamo da možemo slati notifikacije pojedinačnim korisnicima pomoću `Clients.User(idUser)`.



 **Gde se konfiguriše?** Ovo se dodaje u **`Startup.cs`** ili **`Program.cs`**:

```
csharpCopyEditservices.AddSignalR();
services.AddSingleton<IUserIdProvider, CustomUserIdProvider>();
```

Tako omogućavamo da SignalR zna kako da prepoznaje korisnike po ID-ju.



### **Kako radi cela arhitektura notifikacija?**

1. **Korisnik se povezuje na SignalR `NotificationHub`**

   - Konekcija se prepoznaje pomoću `CustomUserIdProvider`.
   - Korisnik može biti deo **grupe** na osnovu svog ID-a.

2. **Backend generiše novu notifikaciju** (npr. novi komentar na post).

   - `NotificationService` kreira notifikaciju u bazi.

      NotificationService zatim poziva:

     ```
     _notificationHubService.SendNotificationToUser(dto.IdUser, dto);
     ```

   - Ovo prosleđuje notifikaciju `SignalRNotificationHub`, koji je samo wrapper za `NotificationHub`.

3. **SignalR obaveštava frontend** u realnom vremenu:

   - Ako korisnik sluša SignalR događaje (`ReceiveNotification`), notifikacija mu se prikazuje odmah.
   - Ako nije povezan, notifikacija će biti vidljiva pri sledećem učitavanju stranice.

4. **Korisnik označava notifikacije kao pročitane**

   - Klikom na dugme frontend šalje zahtev backendu (`MarkAllNotificationsAsRead`).
   - Backend ažurira bazu i šalje **SignalR događaj** da frontend sakrije oznaku "nepročitano".

   

 **Da li su grupe potrebne?**
Grupa korisnika (po `idUser`) omogućava **više konekcija po korisniku**.
Ako korisnik ima više tabova, sve će primiti notifikaciju. Ovo poboljšava UX.



BroadcastMessage - Obaveštenje za sve korisnike da će sajt uskoro biti nedostupan (npr. "Sajt će biti offline za 5 minuta zbog održavanja").

Ako ti trebaju **individualne notifikacije**, `Clients.User(idUser)` je bolja opcija.



EFMarkAllNotificationsAsReadCommand.cs

**Zašto Bulk Update?**
✅ **Brže je nego klasičan `SaveChanges()`** jer pravi **jedan SQL upit**, umesto da pravi update za svaki red pojedinačno.
✅ **Efikasnije** kada treba da ažuriraš veliki broj podataka.







Pristup bazi (`_context`) je direktan i ponavlja se na više mesta. Preporučujem da koristiš **repository pattern** ili **servise** za manipulaciju lajkovima, što bi smanjilo ponavljanje i omogućilo bolju testabilnost.



Napraviti **LikeService**, koji će obraditi dodavanje i ažuriranje lajka.

Prvo, dodaj **interfejs `ILikeService`** u `Application/Services` folder:

Poštujemo **SOLID** principe (posebno **D** – Dependency Inversion Principle).



**Čistiji kod** – komanda sada samo poziva servis, ne upravlja direktno bazom.









**Repository Pattern** je dizajn obrazac koji služi kao **sloj između aplikacije i baze podataka**. Umesto da direktno komuniciramo sa ORM-om (npr. Entity Framework-om), koristimo **Repository sloj** koji enkapsulira logiku pristupa podacima.

👉 **Cilj ovog paterna je:**
✔ **Razdvajanje poslovne logike** od logike pristupa podacima.
✔ **Lakše testiranje** (mockujemo repozitorijum umesto da radimo sa stvarnom bazom).
✔ **Manja zavisnost od ORM-a** (ako jednog dana promeniš ORM, nećeš menjati kod u celom projektu).

Umesto da `LikeService` direktno koristi `BlogContext`, napravićemo poseban repozitorijum **LikeRepository** koji će sadržati metode za rad sa bazom.



**🔍 Šta smo uradili?** ✔ Implementirali **LikeRepository** koji radi sa bazom podataka.
✔ **Ne koristimo direktno `BlogContext`** u servisu.
✔ Možemo lakše testirati servise jer možemo mock-ovati repozitorijum.



✔ `LikeService` više **ne zavisi od `BlogContext`**, već samo od `ILikeRepository`.
✔ Možemo **lako testirati servis** pomoću **mock repozitorijuma**.
✔ **Bolja enkapsulacija** – `LikeRepository` je jedino mesto gde pristupamo bazi podataka.







**Korišćenje DTO objekata:**
Upotreba DTO-a  omogućava jasnu separaciju između podataka koji se šalju preko API-ja i entiteta koji se čuvaju u bazi. Ovo je dobra praksa koja pomaže u održavanju čistoće koda i smanjuje rizik od neželjenih promena u bazi.









Validatori su u sloju **Implementation** kreirani pomoću FluentValidation biblioteke. Validatori su ključni jer se koriste za proveru validnosti podataka koji dolaze u aplikaciju, što pomaže u održavanju konzistentnosti i integriteta podataka pre nego što se izvrše bilo kakve poslovne operacije ili upisi u bazu podataka.

Koristi se nasledjivanje iz AbstractValidator<T>

Ovaj pristup omogućava ponovnu upotrebu validacije na više mesta u aplikaciji, čime se smanjuje dupliciranje koda.

U konstruktoru validatora definisemo niz pravila.

Metoda **RuleFor** očekuje lambda izraz, definiše pravila za validaciju određenih polja ili svojstava objekata.

Koristi  se `Must` metoda sa lambda funkcijom koja proverava da li je vrednost `Status` definisana u enumeraciji `RequestStatus`. To je dobar primer validacije gde se koristi logika da se ograniči unos samo na određene vrednosti, što dodatno sprečava greške.



+Primer:

Provera postojanja svake kategorije

`RuleForEach(x => x.CategoryIds)
    .Must(CategoryExists)
    .WithMessage("Category with the provided ID doesn't exist.");`
**RuleForEach:**
Koristi se da iterira kroz svaki element u kolekciji `CategoryIds` koja je deo DTO-a `UpsertPostDto`. Drugim rečima, za svaku kategoriju (tačnije, svaki ID kategorije) iz liste se izvršava provera.

Metoda `Must` očekuje lambda funkciju ili metodu (u ovom slučaju `CategoryExists`) koja vraća `bool` vrednost. Za svaki ID kategorije, poziva se metoda `CategoryExists` koja proverava da li kategorija sa tim ID-jem postoji u bazi. Evo kako izgleda ta metoda:

`private bool CategoryExists(int id) {    return _context.Categories.Any(x => x.Id == id); }`

- `Any` metoda proverava da li postoji bilo koji zapis u tabeli `Categories` koji ima `Id` jednak vrednosti `id`. Ako postoji, vraća `true`, inače `false`.

Provera duplikata u listi CategoryIds
`RuleFor(x => x.CategoryIds).Must(ids => ids.Distinct().Count() == ids.Count())    .WithMessage("Duplicate categories are not allowed.");`

**RuleFor(x => x.CategoryIds):**
Ovim se pravilo primenjuje na celu kolekciju `CategoryIds`, a ne na svaki pojedinačni element.

**Must(ids => ids.Distinct().Count() == ids.Count()):**
Ova lambda funkcija vrši sledeće:
Metoda `Distinct` vraća kolekciju koja sadrži samo jedinstvene elemente iz originalne liste. Ukoliko u listi postoje duplikati, `Distinct()` će ih eliminisati.
Nakon što se izvrši `Distinct()`, broj jedinstvenih elemenata se poredi sa originalnim brojem elemenata u listi. Ako su oba broja jednaka, to znači da lista nije sadržavala duplikate. U suprotnom, ukoliko je broj manji, postoji barem jedan duplikat.
Ukoliko funkcija vrati `false` (tj. ako postoji bar jedan duplikat), validacija će propasti i korisniku će biti prikazana poruka: *"Duplicate categories are not allowed."* Ovo osigurava da korisnik ne može da prosledi istu kategoriju više puta, čime se održava konzistentnost podataka.

Kombinacijom ovih pravila postiže se:

1. **Validacija postojanja kategorija:**
   Svaka kategorija koju korisnik unosi se proverava da li postoji u bazi. Ovo sprečava greške i potencijalne probleme kada se kasnije koristi nepostojeći ID u poslovnoj logici.
2. **Validacija jedinstvenosti:**
   Proverava se da lista `CategoryIds` ne sadrži duplikate. Time se osigurava da isti post ne bude povezan više puta sa istom kategorijom, što bi moglo da stvori nejasnoće ili greške u daljim procesima.

+

+Primer:
`RuleFor(x => x.Name)`
`.Must((dto, name) => !context.Categories.Any(x => x.Name == name && x.Id != dto.Id))    .WithMessage(p => $"Category with the name of {p.Name} already exists in database.");`

Ovo pravilo proverava da li je ime kategorije (`Name`) koje pokušavamo da ažuriramo jedinstveno unutar baze podataka. Dakle, ako već postoji druga kategorija sa istim imenom, validacija će propasti, čime se sprečava duplikacija imena u bazi.**Razrada lambda izraza u `Must` metodi**

Metoda `Must` prima lambda funkciju sa dva parametra:

- **`dto`:** Ovo je cela instanca DTO-a (`UpsertCategoryDto`) koja se trenutno validira.
- **`name`:** Ovo je vrednost svojstva `Name` iz DTO-a, tj. ime kategorije koje korisnik unosi.

**`context.Categories.Any(...)`:**
Ova metoda proverava da li u bazi postoji bilo koji zapis u tabeli `Categories` koji zadovoljava postavljene uslove.

**Uslov `x => x.Name == name`:**
Proverava se da li postoji kategorija čije ime je isto kao ono što se trenutno unosi.

**Uslov `&& x.Id != dto.Id`:**
Ovo je veoma važno u kontekstu ažuriranja. Kada ažuriraš postojeću kategoriju, u DTO-u se nalazi i `Id` te kategorije. Na ovaj način, uslov osigurava da se ne uzima u obzir trenutna kategorija koja se ažurira, već se traže samo druge kategorije sa istim imenom.

**`!` operator:**
Celo izražavanje se negira. Dakle, validacija će proći (vraća `true`) samo ako **ne postoji** nijedna druga kategorija (sa različitim ID-jem) koja ima isto ime. Ako postoji, uslov će vratiti `false`, čime se validacija ne zadovoljava.





**Centralizovana validacija:** Validatori omogućavaju centralizovanu definiciju svih pravila za validaciju, što olakšava održavanje i modifikaciju tih pravila. Kada se pravilo promeni, dovoljno je promeniti ga na jednom mestu.

**Jasna separacija odgovornosti:** Implementacioni sloj se fokusira na izvršavanje komandi i interakciju sa bazom, dok se validacija odvaja od same poslovne logike. Time se postiže čistija arhitektura i lakše se testira pojedinačne komponente.

**Robusnost:** Pre nego što se izvrši bilo koja poslovna operacija, podaci se proveravaju. Time se smanjuje mogućnost grešaka koje mogu nastati zbog nevalidnih ili neočekivanih ulaza.





**EFCreatePostCommand** je implementacija interfejsa **ICreatePostCommand** i koristi **Entity Framework (EF)** za kreiranje novog posta u bazi podataka. Ova klasa se nalazi u sloju *Implementation* i njena uloga je da sadrži logiku za kreiranje posta, kao i da obavi povezane operacije poput slanja notifikacija pratiocima.



U konstruktoru se koriste sledeće zavisnosti:

- **CreatePostValidator**: Koristi se za validaciju ulaznog DTO objekta. To je često najbolja praksa – da se validacija obavi pre nego što se krene sa poslovnom logikom.
- **IApplicationActor**: Predstavlja trenutno ulogovanog korisnika. Njegov ID se koristi kao autor posta.
- **BlogContext**: EF kontekst koji omogućava rad sa bazom podataka.
- **INotificationHubService** i **INotificationService**: Ove usluge se koriste za kreiranje i distribuciju notifikacija.



U arhitekturama kao što su Clean Architecture ili DDD (Domain-Driven Design), **Domain** sloj sadrži poslovne entitete koji modeluju pravu domenu problema. Koristeći Domain entitete, osiguravamo da logika poslovanja bude centralizovana i konzistentna. To je razlog zbog kojeg se i ovde koristi **Domain.Post** – on predstavlja “pravu” instancu posta sa svim svojim pravilima i poslovnom logikom.



Ovaj deo koda povezuje post sa kategorijama. Svaki ID kategorije iz DTO-a se mapira u novi objekat **PostCategory**. Time se uspostavlja veza između posta i kategorija.

Veoma je važno da se celokupna operacija izvrši unutar transakcije. Ako se bilo šta ne desi kako treba (npr. greška prilikom snimanja u bazu ili slanja notifikacija), izvrši se rollback transakcije. Ovo osigurava konzistentnost podataka.

Nakon što je post uspešno dodat u bazu, pronalaze se svi korisnici koji prate autora postaZa svakog pratioca se kreira notifikacija koja obaveštava da je autor posta (preuzet preko _actor.Identity) objavio novi post. Ovo se radi unutar petlje

Ovo je dobar primer kako se mogu obaviti sporedne operacije unutar iste transakcije. Iako se notifikacije često mogu slati i asinhrono, u ovom slučaju se oni šalju sinhrono, verovatno zbog potrebe za trenutnim obaveštavanjem.



**Centralizacija Poslovne Logike**: Domain modeli sadrže pravila i ponašanje specifično za poslovnu logiku. Time se osigurava da se logika ne duplira na više mesta u aplikaciji.

**Održavanje Konzistentnosti**: Koristeći jedan centralni model (Domain), smanjujemo mogućnost grešaka i neusklađenosti podataka jer svi delovi aplikacije rade sa istim entitetima.

**Razdvajanje Odgovornosti**: DTO (Data Transfer Object) objekti se koriste samo za prenos podataka (npr. iz kontrolera ka komandama), dok Domain modeli predstavljaju pravu poslovnu logiku. Ovo omogućava bolju izolaciju i testabilnost koda.



**EFCreatePostCommand** je komanda koja obavlja kreiranje novog posta i slanje notifikacija pratiocima.

Koristi **Entity Framework** za rad sa bazom podataka i obavlja sve operacije unutar transakcije kako bi se osigurala konzistentnost podataka.

**Domain** modeli, kao što je **Domain.Post**, koriste se da bi se enkapsulirala poslovna logika i omogućilo centralizovano upravljanje entitetima, što je preporučljivo u modernim arhitekturama kao što su Clean Architecture i DDD.



**EFUpdatePostCommand** implementira interfejs **IUpdatePostCommand** i odgovoran je za ažuriranje već postojeće instance posta u bazi. Za razliku od kreiranja novog posta, ovde se radi o pronalaženju već postojećeg zapisa, modifikaciji njegovih svojstava i sinhronizaciji povezanih entiteta (u ovom slučaju, kategorija).



Na početku, DTO objekat **UpsertPostDto** se validira pomoću `_validator.ValidateAndThrow(request);`.

Ovo je najbolja praksa: pre nego što počnemo sa izmenom podataka u bazi, proveravamo da li su ulazni podaci validni. Ukoliko validacija ne prođe, odmah se baca izuzetak i izvršenje se prekida.



**Šta se dešava?**
Pretražujemo bazu da bismo pronašli post sa datim ID-jem. Metoda **Include(x => x.PostCategories)** omogućava učitavanje povezanih kategorija u istom upitu, čime se smanjuje broj poziva ka bazi (eager loading).

Jednostavno se ažuriraju osnovna svojstva posta, kao što su naslov, sadržaj i referenca na sliku. Takođe, postavljamo vreme izmene (`ModifiedAt`) na trenutni datum i vreme, što je korisno za praćenje kada je post poslednji put modifikovan.



**Sinhronizacija Kategorija**
Ovo je možda najinteresantniji deo:

**Preuzimanje Trenutnih Kategorija**

Na osnovu učitanih **PostCategories**, izdvajamo listu trenutnih ID-jeva kategorija povezane sa postom.

**Određivanje Kategorija za Uklanjanje**

Koristimo **Except** da bismo pronašli kategorije koje su trenutno povezane sa postom, ali nisu prisutne u novom setu ID-jeva prosleđenom u DTO objektu.

**Određivanje Kategorija za Dodavanje**

Obrnuto od prethodnog – tražimo ID-jeve koji su prisutni u DTO objektu, ali još nisu povezani sa postom.

**Uklanjanje Nepotrebnih Kategorija**

Za svaku kategoriju koja više nije potrebna, pronalazimo odgovarajući objekat **PostCategory** i uklanjamo ga iz kolekcije.

**Dodavanje Novih Kategorija**

Za svaku novu kategoriju, kreiramo novu instancu **PostCategory** i dodajemo je u kolekciju **PostCategories**. Ovde postavljamo i svojstvo **IsActive** na `true`, što može biti deo poslovne logike da označi aktivne veze između posta i kategorije.



**Eager Loading:**
Dobro je videti da se koristi **Include** za učitavanje povezanih entiteta (u ovom slučaju, **PostCategories**). Ovo pomaže da se izbegne problem tzv. **lazy loading** ili višestruki upiti ka bazi, što je posebno važno kada radimo sa relacijama.

**Diferencijalno Ažuriranje Kategorija:**
Strategija koju koristiš (upoređivanje trenutnih i novih ID-jeva) je efikasna i čista. Time se smanjuje mogućnost grešaka jer eksplicitno definišeš koje veze treba ukloniti, a koje dodati.

**Savjet:** U slučaju da imaš vrlo veliki broj povezanih entiteta, možda bi bilo korisno razmotriti optimizaciju ovog procesa (npr. bulk update ili korišćenje specifičnih biblioteka za sinhronizaciju kolekcija).



EFDeletePersonalPostCommand

`EFDeletePersonalPostCommand` je komanda u ASP.NET Core aplikaciji koja omogućava korisnicima da obrišu **svoj** post. Ova komanda koristi Entity Framework Core za rad sa bazom podataka i osigurava da samo vlasnik posta može izvršiti operaciju brisanja.

Zavisnosti:

- `BlogContext` - DbContext klasa koja omogućava pristup tabelama u bazi podataka.
- `IApplicationActor` - Predstavlja trenutno prijavljenog korisnika i omogućava proveru njegovih prava pristupa.

Logika metode Execute:

1. Pronalazi post u bazi podataka pomoću `request` ID-a.
2. Ako post ne postoji, baca se `EntityNotFoundException`.
3. Proverava da li trenutni korisnik (`_actor.Id`) ima pravo da briše post:
   - Ako korisnik nije vlasnik posta, baca se `UnauthorizedUserAccessException`.
4. Ako je post već obrisan (`IsDeleted == true`), baca se `AlreadyDeletedException`.
5. Ako sve provere prođu:
   - Postavlja se `DeletedAt = DateTime.Now`.
   - Menja se status posta (`IsActive = false`, `IsDeleted = true`).
6. Poziva se `_context.SaveChanges()` kako bi se promene sačuvale u bazi.









EFCreateAuthorRequestCommand

- **Validacija podataka** – koristi `AuthorRequestValidator` da proveri ispravnost unetih podataka.
- **Postavljanje ID korisnika** – dodeljuje `IdUser` iz trenutnog korisnika (`_actor.Id`).
- **Provera da li korisnik već ima podnet zahtev** – ako postoji, baca `AlreadyAddedException`.
- **Kreiranje i upisivanje novog zahteva u bazu** – dodaje novi unos u tabelu `AuthorRequests` i poziva `SaveChanges()`.

EFUpdateAuthorRequestCommand
**Pronalaženje zahteva u bazi** – pretražuje `AuthorRequests` po `Id`.

**Provera da li zahtev postoji** – ako ne postoji, baca `EntityNotFoundException`.

**Ažuriranje statusa zahteva** – menja `Status` i ažurira vreme poslednje izmene (`ModifiedAt`).

**Ažuriranje uloge korisnika (ako je prihvaćen ili odbijen zahtev)**:

- Ako je zahtev **prihvaćen**, korisnik dobija novu rolu i ažuriraju mu se `UseCases`.
- Ako je zahtev **odbijen**, dodeljuje mu se nova rola bez ažuriranja `UseCases`.

**Upis promena u bazu** – `SaveChanges()` čuva izmene.



Ova dva fajla predstavljaju implementaciju **komandi** za kreiranje i ažuriranje zahteva autora u okviru blog sistema koristeći Entity Framework Core.

- **Prvi fajl (`EFCreateAuthorRequestCommand`)** služi za slanje zahteva da korisnik postane autor.
- **Drugi fajl (`EFUpdateAuthorRequestCommand`)** služi administratoru/moderatoru da odobri ili odbije zahtev i ažurira korisničku rolu.



















Tvoj kod implementira funkcionalnost registracije korisnika i automatskog slanja emaila nakon uspešne registracije. Ova funkcionalnost je podeljena na nekoliko ključnih komponenti:

1. **RegisterUserDto** – DTO koji sadrži podatke koje korisnik unosi pri registraciji.
2. **EFRegisterUserCommand** – Klasa koja izvršava registraciju korisnika u bazu podataka.
3. **SMTPEmailSender** – Klasa koja šalje email koristeći SMTP protokol.
4. **IEmailSender** – Interfejs koji definiše metodu za slanje emaila.
5. **EmailSettings** – Klasa koja sadrži konfiguraciju za email server.



```
dotnet add package DotNetEnv
```

.env
SMTP_SERVER=smtp.gmail.com

SMTP_PORT=587

SENDER_EMAIL=blogapiasp@gmail.com

SENDER_PASSWORD=tmoe xbbp gxmn jeco



Kada se pozove metoda `Execute()` klase `EFRegisterUserCommand`, izvršava se sledeći niz operacija:

1. **Validacija korisničkih podataka**
   - Koristi se `RegisterUserValidator` da bi se proverilo da li su uneti podaci validni (npr. email mora biti u ispravnom formatu, lozinka mora biti dovoljno jaka).
2. **Kreiranje korisnika i dodavanje u bazu**
   - Ako su podaci validni, kreira se novi objekat klase `User` i dodaje u bazu podataka.
3. **Dodeljivanje podrazumevanih uloga i permisija korisniku**
   - Nakon dodavanja u bazu, sistem ažurira dozvole korisnika u zavisnosti od njegove uloge.
4. **Komitovanje transakcije**
   - Koristi se transakcija kako bi se osiguralo da svi podaci budu ispravno sačuvani u bazi pre nego što se pošalje email.
5. **Slanje emaila korisniku**
   - Nakon uspešne registracije, korisniku se automatski šalje email o uspešnoj registraciji putem `SMTPEmailSender` servisa.



Nakon što je korisnik uspešno dodat u bazu podataka, poziva se metoda `SendRegistrationEmail()` koja koristi `IEmailSender` servis za slanje emaila.

 Implementacija `SMTPEmailSender` klase

Klasa `SMTPEmailSender` koristi `SmtpClient` za slanje emaila putem SMTP servera.

#### Konstruktor (`SMTPEmailSender`)

- Klasa prima `EmailSettings` preko `IOptions<EmailSettings>` koji dolaze iz `.env`.

#### **Metoda `Send()`**

- Postavlja SMTP klijenta sa parametrima iz `EmailSettings`.
- Kreira email poruku i šalje je na željenu adresu.



Injektovanje Email Settings u `Startup.cs`

U `Startup.cs`, servis se registruje ovako:

```
using Application.Settings;
using DotNetEnv;


            public Startup(IConfiguration configuration)
        {
            Env.Load();
            Configuration = configuration;
        }     

        public void ConfigureServices(IServiceCollection services)
{
services.Configure<EmailSettings>(options =>
            {
                options.SmtpServer = Environment.GetEnvironmentVariable("SMTP_SERVER");
                options.SmtpPort = int.Parse(Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587");
                options.SenderEmail = Environment.GetEnvironmentVariable("SENDER_EMAIL");
                options.SenderPassword = Environment.GetEnvironmentVariable("SENDER_PASSWORD");

            });
services.AddTransient<IEmailSender, SMTPEmailSender>();
}
```

















EFCreatecommetCommand.cs


**Zavisi od nekoliko servisa i klasa:**

- `BlogContext` za rad sa bazom podataka.
- `CreateCommentValidator` za validaciju unetih podataka.
- `IApplicationActor` koji predstavlja trenutnog korisnika.
- `INotificationHubService` i `INotificationService` za upravljanje notifikacijama.

**Proverava podatke pre kreiranja komentara**

- `ValidateAndThrow(request)` koristi FluentValidation da proveri da li je `request` ispravan.

**Dodaje novi komentar u bazu**

- Kreira objekat `Comment`, postavlja potrebne podatke i dodaje ga u bazu.

**Kreira i šalje notifikacije:**

- Ako korisnik komentariše **tuđi post**, obaveštava vlasnika posta.
- Ako korisnik **odgovara na komentar**, obaveštava vlasnika parent komentara (ako nije isti korisnik).



Also, in the Authors component, after fetching the data, they filter the results with data.items.filter(author => author.roleName == 'Author'). But if the backend isn’t applying the OnlyAuthors filter correctly, the client might be receiving all users and then filtering them. That’s redundant and could cause issues if the backend isn’t paginating correctly based on the filtered results. The page count from the backend might not match the client’s filtered list, leading to pagination errors.

Also, the UsersController’s GetImage method serves images from wwwroot/UserImages. If the React app is trying to display user avatars, but the image paths are incorrect, that could cause issues. The getAvatarSrc function in the React app should be generating correct URLs, like /users/images/filename.jpg, which the backend should handle. But if the images aren’t being uploaded to the correct directory or the path is wrong, avatars might not load, though that’s a separate issue from routing.



You need to **separate client-side routes from API endpoints**:

- **Never mix client-side routes and API endpoints** without a prefix
  - Keep client-side routes separate from proxy paths





FileExtension.cs

Ova klasa pruža metod za otpremanje slika na server, čime se osigurava da svaki fajl dobije jedinstveno ime i bude smešten u odgovarajuću fasciklu.

**Generiše jedinstveno ime** za fajl koristeći `Guid.NewGuid()`, čime se izbegava preklapanje sa postojećim fajlovima.

**Čuva fajl u direktorijumu** `wwwroot/UserImages` kako bi bio lako dostupan putem HTTP zahteva.

**Vraća novo ime fajla**, koje se kasnije upisuje u bazu.
✔ **Brišemo staru sliku pre snimanja nove**, sprečavajući nagomilavanje nepotrebnih fajlova.
✔ **Koristimo asinhrone metode** (`await` + `async`) za bolje performanse.



EFUpdateUserCommand.cs

Ova klasa implementira `IUpdateUserCommand` i omogućava korisnicima da ažuriraju svoje podatke, uključujući promenu profilne slike.

Ako je slika prosleđena, koristi `UpdateUserValidator`, inače `UpdateUserWithoutImageValidator`.
Koristi `Include(x => x.UserUseCases)` kako bi dobio i podatke o slučajevima upotrebe.
Ako je slika prosleđena, koristi `UploadImage()` da sačuva novi fajl i dobije ime koje se čuva u bazi.
Ako je lozinka uneta, hešira se pomoću `EasyEncryption.SHA.ComputeSHA256Hash()`.





Ove metode služe za upravljanje kategorijama u blog sistemu. Koriste ih administratori ili moderatori putem API-ja ili administratorskog panela.

### **1. `EFCreateCategoryCommand`**

📌 **Šta radi?**

- Kreira novu kategoriju u bazi podataka nakon validacije.

👤 **Ko koristi?**

- Administrator/moderator koji dodaje novu kategoriju putem administratorskog panela ili API-ja.

------

### **2. `EFDeleteCategoryCommand`**

📌 **Šta radi?**

- Briše kategoriju, ali samo ako nema povezanih postova i nije već obrisana.
- Umesto fizičkog brisanja, označava kategoriju kao neaktivnu (`IsDeleted = true`).

👤 **Ko koristi?**

- Administrator/moderator kada želi da ukloni neku kategoriju.

------

### **3. `EFUpdateCategoryCommand`**

📌 **Šta radi?**

- Ažurira naziv postojeće kategorije nakon validacije.

👤 **Ko koristi?**

- Administrator/moderator kada želi da promeni ime kategorije.





### **Like Komentara i Like Posta – Objašnjenje**

Ove dve klase **`EFLikeCommentCommand`** i **`EFLikePostCommand`** implementiraju funkcionalnost lajkovanja komentara i postova u blog sistemu.

## **1. Lajkovanje komentara (`EFLikeCommentCommand`)**

📌 **Šta radi?**

- Validira podatke koristeći `LikeCommentValidator`.
- Koristi **`ToggleLike`** metodu iz `ILikeService` da doda ili ukloni lajk.
- Ako je lajk dodat, kreira novu notifikaciju za autora komentara.
- Transakcijski pristup – u slučaju greške, sve promene se vraćaju (`Rollback`).

👤 **Ko koristi?**

- Ulogovani korisnici koji lajkuju komentare na postovima.
- EFLikeCommentCommandSistem notifikacija za obaveštavanje autora komentara.



## **Lajkovanje posta (`EFLikePostCommand`)**

📌 **Šta radi?**

- Validira podatke koristeći `LikePostValidator`.
- Koristi `ToggleLike` iz `ILikeService` da doda ili ukloni lajk.
- Ako je lajk dodat, kreira se notifikacija za autora posta.
- Koristi transakcijski pristup – sprečava nekonzistentne podatke u slučaju greške.

👤 **Ko koristi?**

- Ulogovani korisnici koji lajkuju postove.
- Sistem notifikacija za obaveštavanje autora posta.



















EFGetAuthorRequestsQuery

Ovaj kod predstavlja **implementaciju paginiranog pretraživanja zahteva za autorstvo** u ASP.NET aplikaciji koristeći Entity Framework. Hajde da analiziramo sve delove i njihovu međusobnu povezanost.

Fajl `IUseCase` definiše interfejse za komande (`ICommand<TRequest>`) i upite (`IQuery<TResponse, TSearch>`).

- **`IUseCase`** je osnovni interfejs koji svaki "use case" mora implementirati

✅ **Povezanost**: Ovi interfejsi omogućavaju standardizaciju komandi i upita u aplikaciji.

DTO služi za **prenos podataka** između slojeva aplikacije.

- `GetAuthorRequestsDto` predstavlja jedan zahtev za autorstvo koji će biti prikazan korisnik

✅ **Povezanost**: Ovaj DTO se koristi u `PagedResponse<GetAuthorRequestsDto>` za vraćanje podataka iz baze.



. Search Modeli – `AuthorRequestSearch` i `PagedSearch`

Pretraga koristi posebne klase za filtriranje podataka.

- `PagedSearch` je **osnovna klasa za sve pretrage** i sadrži paginaciju

`AuthorRequestSearch` proširuje `PagedSearch` i dodaje filter `Reason`.

✅ **Povezanost**: Ove klase se koriste za paginirano pretraživanje zahteva za autorstvo.



🔹 4. PagedResponse – Generički Model za Paginaciju

Klasa `PagedResponse<T>` je **generička klasa** koja vraća **rezultate pretrage sa paginacijom**.

- Ova klasa se koristi u `EFGetAuthorRequestsQuery` za vraćanje rezultata pretrage.

🔹 5. `IGetAuthorRequestsQuery` – Interfejs za Pretragu

- Definiše **specifičan upit** za dobavljanje zahteva za autorstvo.
- Koristi `PagedResponse<GetAuthorRequestsDto>` za vraćanje podataka.
- Prihvaća `AuthorRequestSearch` za filtriranje.

✅ **Povezanost**: Ovaj interfejs je ugovor koji implementira `EFGetAuthorRequestsQuery`.



`EFGetAuthorRequestsQuery` – Implementacija Upita

### **Šta radi ova klasa?**

- Pronalazi **zahteve za autorstvo** iz baze podataka.
- Filtrira ih na osnovu `Reason` polja (ako je prosleđen).
- Vraća podatke **paginirano**.

**Priprema upita**

**Filtrira zahteve po razlozima (ako je prosleđen)**

**Filtrira samo aktivne zahteve**

```
var skipCount = search.PerPage * (search.Page - 1); Računa paginaciju
```

**Vraća paginirane podatke u `PagedResponse<GetAuthorRequestsDto>`**

- Ova klasa implementira `IGetAuthorRequestsQuery` i vraća podatke koristeći `PagedResponse<GetAuthorRequestsDto>`.



## **Kako Sve Radi Zajedno?**

1. **Korisnik pošalje API zahtev sa parametrima pretrage** (npr. `GET /author-requests?page=2&reason=novi%20autor`).
2. **Kontroler pozove `IGetAuthorRequestsQuery.Execute(AuthorRequestSearch search)`**.
3. **EFGetAuthorRequestsQuery pretražuje bazu, primenjuje filtere i paginaciju**.
4. **Dobijeni podaci se vraćaju u `PagedResponse<GetAuthorRequestsDto>`**.
5. **Frontend prikazuje listu zahteva za autorstvo**.























EFGetCategoriesQuery
Ako `search.GetAll == true`, vraća sve kategorije.

Ako je `GetAll == false`, primenjuje **paginaciju** (npr. ako tražimo 10 kategorija po strani).

Vraća rezultat u obliku `PagedResponse<GetCategoriesDto>`, koji sadrži listu kategorija i informacije o paginaciji.



 **EFGetOneCategoryQuery** – Dohvatanje jedne kategorije sa njenim postovima

Implementira interfejs `IGetCategoryQuery`.

Učitava **jednu kategoriju** zajedno sa njenim postovima.

Koristi `Include` i `ThenInclude` da učita povezane entitete.

Podržava **paginaciju postova u okviru kategorije**.



Ove klase omogućavaju **efikasno dohvatanje**:

1. **Liste kategorija** (`EFGetCategoriesQuery`) sa opcionalnom paginacijom.
2. **Jedne kategorije i njenih postova** (`EFGetOneCategoryQuery`), sa mogućnošću paginacije postova.







EFGetOneCommentQuery, EFGetCommentsQuery

Ovo su **CQRS** upiti (**queries**) u **C#/.NET**, koji koriste **Entity Framework (EF)** za čitanje komentara u blog sistemu. Pregledaćemo kod, objasniti kako funkcioniše i ukazati na eventualne probleme i poboljšanja.

EFGetCommentsQuery

- Implementira `IGetCommentsQuery`, vraća **komentare sa paginacijom**.
- **Podržava filtriranje po korisničkom imenu**.
- **Računa broj komentara u poslednjih 30 dana**.
- **Vraća i broj lajkova na komentare**.
- 📌 **Primenjuje paginaciju i transformiše podatke u DTO format**.



EFGetOneCommentQuery

Implementira `IGetCommentQuery`.

Dohvata **jedan komentar** po ID-u.

**Učitava korisnika, post i lajkove**.

Ako ne postoji, baca `EntityNotFoundException`.

📌 **Vraća DTO sa informacijama o komentaru**.



### **1. `EFCheckFollowStatusQuery`**

- Ovaj upit proverava da li trenutni korisnik ( `_actor.Id` ) prati korisnika sa `idFollowing`.
- Koristi `Any()` da brzo proveri postojanje zapisa u tabeli `Followers`.
- **Naziv ima smisla** jer opisuje svrhu klase – provera statusa praćenja (Follow Status).

✅ **Predlog za poboljšanje:**

- Možda bi bilo korisno vratiti ne samo `true/false`, već i više informacija ako kasnije zatreba (npr. datum kada je započeto praćenje).



### **`EFGetFollowersQuery`**

- Ovaj upit vraća paginiranu listu korisnika koji prate određenog korisnika (`IdUser`).
- Učitava podatke o pratiocima kroz `Include(f => f.FollowerUser)`.
- **Naziv ima smisla** jer opisuje da dohvaća pratioce određenog korisnika.

✅ **Predlog za poboljšanje:**

- `followers.ToList()` se poziva pre paginacije, što može biti neefikasno ako je baza velika. Bolje je da se koristi `AsQueryable()` i paginacija pre `ToList()`.

  



### **`EFGetFollowingsQuery`**

- Ovaj upit vraća listu korisnika koje određeni korisnik prati (`idUser`).
- Slično prethodnom, ali koristi `IdFollower` za filtriranje.
- **Naziv ima smisla**, ali može biti malo neprecizan – možda `EFGetFollowingUsersQuery` da naglasi da vraća korisnike, a ne samo "praćenja".

✅ **Predlog za poboljšanje:**

- Nedostaje paginacija (za razliku od `EFGetFollowersQuery`). Ako ima mnogo rezultata, upit može biti neefikasan.









EFGetNotificationsQuery.cs

Metoda `Execute` omogućava dohvaćanje notifikacija na osnovu korisnika i tipa notifikacije, uz podršku za paginaciju. Rezultat se vraća u formatu koji omogućava lako prikazivanje podataka na frontend strani.

**Filtriranje po tipu notifikacije (`Type`)**

**Formiranje `PagedResponse<GetNotificationDto>` objekta**
Popunjava se DTO (`GetNotificationDto`) sa podacima o notifikacijama.



**EFGetPostQuery**

Koristi se za dobijanje detalja o pojedinačnom blog postu. Koristi **Entity Framework** za pristup podacima i implementira **IGetPostQuery**, što znači da implementira metod `Execute(int search)` koji vraća **GetPostDetailsDto** objekat na osnovu prosleđenog ID posta.

**Učitavanje podataka o postu**

- Koristi se **Include** i **ThenInclude** kako bi se učitali svi relevantni podaci o postu:
  - **Likes** (svi lajkovi posta)
  - **User** (korisnik koji je kreirao post)
  - **Image** (slika vezana za post)
  - **Comments** i njihovi **User** podaci
  - **PostCategories** i povezane **Category** informacije
- Pronalazi konkretan post pomoću `FirstOrDefault(a => a.Id == search);`.

**Mapiranje rezultata u `GetPostDetailsDto`**

- Kreira se DTO objekat 

  GetPostDetailsDto, koji sadrži:

  - Osnovne informacije o postu

  - Informacije o slici i korisniku

  - Kategorije posta (`PostCategories`)

  - Lajkovi posta (`Likes`)

  - Komentari

    - Prvo se uzimaju samo komentari koji nemaju roditelja (`IdParent == null`).

    - Svaki komentar sadrži osnovne informacije, lajkove i potom traži **dečije komentare** (`ChildrenComments`), koji se ponovo učitavaju filtriranjem iz iste liste `query.Comments`.

      

#### **Problem sa `ChildrenComments` upitom**

- `ChildrenComments` se ponovo filtrira iz `query.Comments` unutar `.Select()`, što znači da se pravi dodatni upit za svaki roditeljski komentar.
- **Optimizacija**: Preuzeti sve komentare u memoriju, pa grupisati ih pre mapiranja u DTO.

- **Optimizacija**: Preuzeti sve komentare u memoriju i grupisati ih pomoću LINQ.

✅ **Manje upita ka bazi** – Svi komentari i lajkovi se učitavaju u **jednom** upitu, umesto više njih.

✅ **Brže izvršavanje** – Grupisanje u memoriji je mnogo brže nego višestruki upiti.

✅ **Lakše održavanje** – Kod je sada čitljiviji i skalabilan za komentare sa više nivoa.

// Rekurzivno dodavanje child komentara
**Funkcija za rekurzivno pravljenje hijerarhije komentara**







Okay, hajde da pogledam ovaj C# kod i pokušam da shvatim kako funkcioniše deo sa komentarima i rekurzivnim građenjem stabla. Prvo, vidim da je u pitanju Entity Framework upit koji dobavlja jedan post sa svim svojim komentarima, lajkovima, kategorijama itd. Glavni cilj je verovatno prikazati post sa svim komentarima i njihovim podkomentarima u hijerarhijskom obliku, što podrazumeva da svaki komentar može imati decu (odgovore), a ta deca mogu imati svoju decu itd.

Prvo, treba da razumem strukturu komentara. U bazi, svaki komentar ima IdParent koji pokazuje na komentar koji je roditelj. Ako je IdParent null, onda je to komentar prvog nivoa. Ako ima IdParent, onda je to odgovor na neki drugi komentar. Dakle, ovo je tipična stablasta struktura.

U kodu, prvo se učitavaju svi komentari za post, zajedno sa korisnicima i lajkovima. Onda se pravi lookup (recnik) grupisanih komentara po IdParent. Ključ u ovom recniku je IdParent, a vrednost je lista komentara koji imaju taj IdParent. Ovo je ključno za rekurzivno građenje stabla.

Funkcija BuildCommentTree se poziva sa null kao argument za idParent, što znači da počinjemo od komentara prvog nivoa (oni koji nemaju roditelja). Ova funkcija prvo proverava da li u lookup-u postoji ključ jednak idParent (u prvom pozivu 0, jer je idParent null, pa se pretvara u 0). Ako postoji, uzima sve komentare sa tim IdParent i za svaki od njih kreira DTO objekat, a zatim rekurzivno poziva BuildCommentTree sa id-om trenutnog komentara kako bi pronašao sve njegove podkomentare.

Na primer, ako imamo komentar sa Id=1 i IdParent=null, on će biti u grupi pod ključem 0 (jer je null pretvoren u 0). Kada se pozove BuildCommentTree(null), pronaći će sve komentare sa IdParent=0, što su komentari prvog nivoa. Za svaki od tih komentara, poziva se BuildCommentTree sa Id=1, što će tražiti sve komentare sa IdParent=1, i tako dalje dok se ne istraži celo stablo.

Bitno je primetiti da se rekurzija zaustavlja kada više nema komentara za dati IdParent. Naime, ako u lookup-u ne postoji ključ za trenutni IdParent, vratiće se prazna lista, čime se prekida dalje grananje.

Ova metoda efikasno gradi stablo tako što koristi rekurziju i pretraživanje prethodno grupisanih komentara. Umesto da se za svaki komentar posebno vrši upit u bazu, svi komentari su već učitani i grupovani u memoriji, što smanjuje broj roundtrip-ova ka bazi i poboljšava performanse.

Moguće probleme koje treba razmotriti:

\- Kako se rukuje sa velikim brojem komentara? Grupisanje u memoriji može postati problematično za veoma velike količine podataka.

\- Da li postoji maksimalna dubina rekurzije? U .NET-u postoji ograničenje na dubinu rekurzije, ali u praksi, za komentare, retko će se dostići to ograničenje.

Zaključak: Ova rekurzivna funkcija koristi lookup recnik za brzo pronalaženje podkomentara i gradi stablo tako što za svaki komentar traži njegovu decu i rekurzivno gradi njihove podstabla, što rezultira kompletnom hijerarhijom komentara za dati post.

Ovaj kod koristi rekurzivnu funkciju za izgradnju hijerarhijske strukture komentara, gde svaki komentar može imati podkomentare (odgovore). 



- Prvo se učitava post sa svim svojim komentarima (`Include(com => com.Comments)`), zajedno sa korisnicima i lajkovima.
- Komentari se učitavaju kao ravna lista, gde svaki komentar ima `IdParent` koji pokazuje na roditeljski komentar (ako postoji).
- Grupisanje komentara po idParent
- Ova linija kreira rečnik (`Dictionary`) gde je ključ `IdParent`, a vrednost lista komentara sa tim `IdParent`.
- `IdParent ?? 0` znači da se `null` vrednosti (komentari bez roditelja) tretiraju kao 0. Ovo omogućava da komentari prvog nivoa budu grupisani pod ključem 0.

 **Rekurzivna funkcija `BuildCommentTree`**

- **Provera postojanja ključa**: Ako u `commentsLookup` postoji lista komentara za dati `idParent`, obrađujemo ih.
- **Rekurzivni poziv**: Za svaki komentar, poziva se `BuildCommentTree(c.Id)` da bi se pronašli svi podkomentari (deca) trenutnog komentara.



### **Kako radi rekurzija?**

- **Komentari prvog nivoa**: Npr. komentar sa `Id = 1` i `IdParent = null` će biti u grupi pod ključem 0.
- **Prvi poziv**: `BuildCommentTree(null)` pronalazi sve komentare sa `IdParent = 0`.
- Za svaki takav komentar (npr. `Id = 1`), poziva se `BuildCommentTree(1)` da pronađe njegovu decu (komentare sa `IdParent = 1`).
- Proces se ponavlja za svaku decu, sve dok ne budu obrađeni svi nivoi.



- Rekurzija se zaustavlja kada za dati `idParent` ne postoje komentari u `commentsLookup`. Tada se vraća prazna lista, što znači da trenutni komentar nema dece.

- **Efikasnost**: Svi komentari se učitavaju jednim upitom, a zatim se procesiraju u memoriji.
- **Jednostavnost**: Rekurzivna funkcija jasno modeluje hijerarhiju.









EFGetPostsQuery
Učitava `Posts` tabelu iz baze.

`Include(x => x.PostCategories).ThenInclude(x => x.Category)` učitava povezane kategorije postova (tj. `PostCategories` i zatim `Category`).

`.AsQueryable()` omogućava dalju filtraciju upita.

Filtriranje prema sadrzaju i naslovu.

Proverava da li korisnik filtrira postove po određenim kategorijama (`CategoryIds`).
Koristi `Any()`, da bi pronašao postove koji imaju **bar jednu** od izabranih kategorija.

Ako je korisnik uneo `SortOrder`, proverava da li je `"asc"` ili `"desc"`.
Sortira postove po datumu kreiranja (`CreatedAt`).



 Paginacija (preskakanje i uzimanje postova)

- Na primer, ako je korisnik na stranici `2`, a `PerPage` je `10`, tada će preskočiti `10 * (2-1) = 10` postova.



Kreira objekat `PagedResponse<GetPostsDto>`.

Puni ga podacima: trenutna strana, broj elemenata po strani, ukupan broj postova.

Puni `Items` sa odgovarajućim postovima koristeći `.Skip().Take()`.

Konvertuje postove u `GetPostsDto`.



Koriscenje niza umesto objekta za userUseCases 

Ovo bi imalo nekoliko prednosti:

1. **Manje podataka** – smanjuje se količina podataka koji se vraćaju iz baze i šalju klijentu.
2. **Lakše korišćenje** – ako ti trebaju samo ID-evi za proveru dozvola, autorizaciju itd., lakše ih je koristiti kao običan niz.
3. **Performanse** – eliminacija nepotrebnih objekata poboljšava brzinu obrade i smanjuje memorijski otisak.

Ako ipak planiraš da kasnije proširiš `GetUserUseCaseDto` sa dodatnim podacima (npr. naziv use case-a), onda bi trenutni model `{ idUseCase: 5 }` imao smisla.





Da, možeš poboljšati način na koji dobijaš nazive **use case-ova** koristeći mapiranja ili enumeraciju (`UseCaseEnum`). Pošto tabela `UserUseCases` nema naziv use case-a, najbolje rešenje je da ga generišeš iz `UseCaseEnum`.

## 🔹 **Rešenje**

Umesto da menjaš bazu podataka, možeš dodati mapiranje koje će u DTO ubaciti naziv use case-a na osnovu `UseCaseEnum`.

1. **Prilikom selektovanja podataka**, koristi `Enum.GetName(typeof(UseCaseEnum), x.IdUseCase)` da generišeš naziv use case-a.

























2. **<u>API</u>** Predstavlja prezentacioni sloj koji izlaže RESTful (ili drugi tip) endpoint-e. Tu se nalaze kontroleri, middleware, rute, autentikacija, autorizacija i ostale konfiguracije vezane za HTTP komunikaciju.

Ovaj API je razvijen kao poseban sloj aplikacije koji koristi HTTP protokol kao komunikacioni kanal između klijentske aplikacije i sistema. Klijentska aplikacija, koja se oslanja na Client-Side Rendering, šalje HTTP zahteve ka API-u radi izvršenja različitih operacija.



## Princip rada API-a

Kada klijent pošalje HTTP zahtev:

- **Za pretragu entiteta** koristi **query** na odgovarajućem endpoint-u.
- **Za kreiranje entiteta** koristi **command**.
- API prepoznaje koji use case treba da se izvrši na osnovu zahteva i delegira implementaciju Application sloju.
- Implementacija diktira način obrade podataka – bilo da se koristi Entity Framework (EF) ili drugi mehanizam za rad sa bazom.
- Na kraju, API koristi domenske objekte za čuvanje podataka u bazu.

## Slojna arhitektura

Sistem je razvijen kroz jasno definisane slojeve koji određuju način komunikacije između komponenti. Klijentske aplikacije ne moraju da budu svesne unutrašnjih granica sistema – one jednostavno šalju zahteve API-u. Na primer, kada klijent iz browser-a pošalje AJAX zahtev na `http://89.445.21.09:80/api/blogs` sa HTTP POST metodom, on ne zna da taj zahtev dolazi do kontrolera. Kontroler zatim delegira posao dalje kroz sistem.

Kontroler ne bi trebalo da zavisi od konkretne implementacije, već isključivo od apstrakcije. Metode u kontroleru komuniciraju sa interfejsima, a ne direktno sa implementacijama. To omogućava fleksibilnost i modularnost koda, bez obzira na to da li se u pozadini koristi SQL baza, MongoDB ili čak običan tekstualni fajl.



## Principi dizajna

U razvoju ovog API-a primenjeni su SOLID principi:

- **Interface Segregation Principle (ISP)** – Klijent prima samo podatke koji su mu potrebni, bez suvišnih detalja o internoj implementaciji klase.
- **Dependency Injection (DI)** – Vezuje interfejse za implementacije, omogućavajući kontroleru da zatraži određeni interfejs, dok DI container obezbeđuje odgovarajuću implementaciju.
- **Liskov Substitution Principle (LSP)** – Svaka apstrakcija (nadklasa, interfejs) mora biti kompatibilna sa bilo kojom svojom implementacijom.







API treba da vraća podatke u obliku niza ili objekta – nikada u vidu običnog stringa. JavaScript klijent ne bi trebalo da vidi interne detalje klase koje nisu relevantne za njegov rad.

Implementacija DI kontejnera u ovom API-u se oslanja na servisnu registraciju, kao što je:

```
services.AddTransient<>();
```

Ovim pristupom obezbeđujemo modularnost, fleksibilnost i održivost sistema, omogućavajući lako prilagođavanje različitim implementacijama u budućnosti.





### **Objašnjenje JWT-a **

Autorizacija: Korisnik unosi kredencijale u formu i klikom na dugme „submit“ šalje prvi AJAX zahtev ka serveru na rutu `/api/login`. Korisničko ime i lozinka šalju se kroz body zahteva. Server proverava da li postoji korisnik sa tim korisničkim imenom i lozinkom, i ako postoji, vraća objekat sa JWT tokenom u formatu `{ token: "snv321nv129xzfrn3AA3" }`. Ukoliko korisnik ne postoji, server vraća statusni kod 401. Taj statusni kod neće puno značiti korisniku, ali omogućava serveru da verifikuje klijenta svaki put.

Klijent čuva token, obično u LocalStorage-u, i prilikom svakog narednog AJAX zahteva prosleđuje ovaj token. Svakom sledećem zahtevu se dodaje HTTP header: `Authorization: Bearer 8yt#&!Gbjhasbd1uvbyZX&^f#`. Na taj način, server može da prepozna klijenta.

Pored toga što klijent dobija token i prosleđuje ga svaki put serveru radi validacije, potrebno je i da ima pristup određenim informacijama o JWT-u. JWT je dizajniran na specifičan način, sa tri segmenta, kako bi se omogućila efikasna i sigurna komunikacija između klijenta i servera.



#### **Šta je JWT (JSON Web Token)?**

JWT je JSON-objekat koji sadrži podatke o korisniku, digitalno je potpisan i koristi se za autentifikaciju i autorizaciju. Ima tri dela:

1. **Header** – metapodaci o tokenu (tip i algoritam potpisa).
2. **Payload** – podaci o korisniku i dozvolama, claims koje se prenose izmedju klijenta i servera - kodiran u JSON formatu.
3. **Signature** – digitalni potpis koji osigurava integritet podataka.

JWT se često koristi u **stateless** autentifikaciji, gde server ne čuva korisničke sesije, već se oslanja na validaciju tokena poslatog u svakom zahtevu.



LoginController.cs

Lozinka se hashira pre slanja u bazu, ali ako ne koristiš **bcrypt/scrypt**, može se brute-force napasti.

Nedostaje **rate limiting** i zaštita od **brute-force napada**.



JWTSettings
**Osiguravamo da ENV varijable postoje** (inače aplikacija baca grešku).
**Ne oslanjamo se na `appsettings.json`** (samo ENV).

Menjamo `EmailSettings.cs` da **isključivo koristi** ENV varijable.





**JWT validacija sada isključivo koristi ENV vrednosti**.

**EmailSettings se učitava pre nego što se doda `IEmailSender`**, bez `appsettings.json`.





Da, možeš koristiti `AddJWT` iz `APIExtensions.cs` u `Startup.cs`. Već si ga pozvao ovde:

```
services.AddJWT(appSettings);
```



**`AddJWT` ekstenzija** dodaje:

- `JWTManager` kao `Transient` servis, koristeći `BlogContext` i vrednosti iz `JWTSettings`.
- JWT autentifikaciju preko `AddJwtBearer`, gde postavlja parametre validacije tokena.
- Podesava `OnMessageReceived` event za podršku SignalR-u, omogućavajući prijem tokena preko query stringa.

**Ispravan redosled u `ConfigureServices`**:

- **`AddJWT(jwtSettings)` je pozvan pre `UseAuthentication()` i `UseAuthorization()`** → što je ispravno jer middleware za autentifikaciju treba da zna kako da validira JWT.
- Koristi `jwtSettings koji se dodaje kao `Singleton`, što osigurava da se vrednosti pravilno učitavaju.







- **Proveri da li `BlogContext` u `JWTManager` treba da bude `Scoped`, a ne `Transient`**, jer `DbContext` treba da živi u okviru jedne HTTP request transakcije.







U ASP.NET Core-u, kada registruješ servise u `IServiceCollection`, možeš koristiti tri vrste životnih ciklusa:

- **`AddTransient`** – kreira **novu instancu servisa svaki put** kada se on zatraži.
- **`AddScoped`** – kreira **jednu instancu servisa po HTTP zahtevu**.
- **`AddSingleton`** – kreira **jednu instancu servisa za ceo životni vek aplikacije**.

### 🔹 `AddTransient`

- Svaki put kada se servis zatraži, kreira se **nova instanca**.

- Pogodno za **stateless** servise koji ne čuvaju podatke između poziva.

- Primer:

  ```
  services.AddTransient<IMyService, MyService>();
  ```

- Koristi se za **lake servise** (nema potrebe za dijeljenjem podataka).

- **Primer upotrebe:**

  - Servisi koji **ne zavise od podataka sa prethodnog request-a**.
  - Npr. `EmailSender` → svaki put kada se pozove, šalje e-mail i ne mora pamtiti stanje.



###  `AddScoped`

- Kreira **jednu instancu servisa po HTTP zahtevu**.

- Ako se servis zatraži više puta u istom HTTP zahtevu, **koristiće se ista instanca**.

- Primer:

  ```
  services.AddScoped<IMyRepository, MyRepository>();
  ```

- Koristi se za **servise koji rade sa podacima iz baze**, jer omogućava da se isti `DbContext` koristi kroz ceo request.

- **Primer upotrebe:**

  - `DbContext` u EF Core-u
  - `Repository` koji koristi isti kontekst podataka



###  Ključna razlika:

- **Transient** servisi su **uvek novi**, pa mogu imati **problem sa performansama** ako se previše često koriste.
- **Scoped** servisi su **isti u okviru jednog request-a**, pa su idealni za **bazu podataka** jer sprečavaju previše otvaranja konekcija.

👉 **Ako koristiš `DbContext`, uvek ga registruj sa `AddScoped`, a ne `AddTransient`, da ne bi imao probleme sa više instanci baze u istom request-u.**

















Za registraciju `JWTManager` u `AddJWT` metodi, **bolje je koristiti `AddScoped` umesto `AddTransient`**.

### 🔹 **Zašto koristiti `AddScoped`?**

- `JWTManager` zavisi od `BlogContext`, koji bi **uvek trebalo da bude `Scoped`** da bi koristio istu instancu baze tokom jednog HTTP zahteva.
- Ako koristiš `AddTransient`, može doći do problema sa **više instanci `DbContext` u istom request-u**, što može izazvati probleme sa transakcijama i performansama.
- `JWTManager` se najverovatnije koristi u kontekstu autentifikacije i autorizacije, što znači da će biti potreban više puta u toku istog HTTP zahteva – ako je `Scoped`, neće se ponovo instancirati.

### ✅ **Ispravna verzija**

```
csharpCopyEditservices.AddScoped<JWTManager>(x =>
{
    var context = x.GetService<BlogContext>();
    return new JWTManager(context, jwtSettings.JwtIssuer, jwtSettings.JwtSecretKey);
});
```

### 🚫 **Nemoj koristiti `AddTransient` jer:**

- Svaki put kada se `JWTManager` traži, stvaraće se **nova instanca**, što može dovesti do nepotrebnog kreiranja `DbContext` instanci.
- To može dovesti do **"DbContext disposed" grešaka**, jer se `DbContext` može uništiti pre nego što se `JWTManager` završi.

### 📝 **Zaključak**

**Koristi `AddScoped` za `JWTManager` jer zavisi od `DbContext`, koji treba da bude `Scoped` da bi izbegao probleme sa višestrukim instancama baze u istom HTTP zahtevu.**







### P**roblem: `AddTransient<BlogContext>()`**

**✅ Treba koristiti `AddScoped<BlogContext>()` umesto `AddTransient<BlogContext>()`.**

- `BlogContext` (EF Core `DbContext`) treba biti **Scoped**, jer je dizajniran da traje samo tokom trajanja HTTP requesta.
- Ako koristiš `Transient`, svaki put kada se zatraži `BlogContext`, dobićeš novu instancu, što može izazvati probleme sa transakcijama i performansama.







### **🔹 Kako ovo radi?**

1. **Kreiramo objekte `JWTSettings` i `EmailSettings`**, koji predstavljaju klase za konfiguraciju.
2. `Configuration.Bind(nameof(JWTSettings), jwtSettings);`
   - Ova linija puni `jwtSettings` vrednostima iz **appsettings.json**, **okruženja (.env)** ili **drugih konfiguracionih izvora** (zavisno od toga kako je `Configuration` podešen).
3. `services.AddSingleton(jwtSettings);`
   - Dodajemo `jwtSettings` kao **Singleton**, što znači da će isti objekat biti korišćen u celoj aplikaciji.









U React aplikaciji, kod za logovanje se nalazi u `SignIn.js` komponenti. Ovde su ključni delovi koda:

- `handleSubmit` funkcija:
  - Kada korisnik pošalje formu, ova funkcija se poziva.
  - `dispatch(signInStart())` označava početak procesa logovanja (koristi Redux za praćenje statusa).
  - Koristi `fetch` da pošalje POST zahtev na `/api/login` sa korisničkim podacima (email i lozinka).
  - Ako je odgovor sa servera uspešan, uzima se JWT token iz odgovora, dekodira se pomoću `jwtDecode` i korisnički podaci se čuvaju u aplikaciji.
  - Token se takođe sprema u `localStorage`, što omogućava korisniku da ostane prijavljen.
  - Na kraju, korisnik se preusmerava na početnu stranu (`navigate('/')`).



Backend se sastoji iz nekoliko ključnih komponenata:

- `LoginController` (u `api/login`)
  - Ovaj kontroler prihvata korisničke podatke, proverava lozinku, generiše JWT token i vraća ga u odgovoru.
  - Lozinka se hashuje pomoću `BCrypt` pre nego što se uporedi sa onom u bazi podataka.
  - Ako su podaci tačni, generiše se JWT token i korisnik je autentifikovan.

**Tok:**

1. Prvi zahtev je poslat sa korisničkim podacima.
2. Na backendu, lozinka se upoređuje sa hash-om u bazi.
3. Ako su podaci ispravni, generiše se JWT token koji sadrži informacije o korisniku.
4. Taj token se šalje korisniku i čuva se na frontendu (u `localStorage`).



**`AuthController`**:

- Ovaj kontroler omogućava prijavu putem Google naloga (OAuth).
- Ako korisnik nije registrovan, kreira se novi nalog, a zatim se generiše JWT token.



- `JWTManager`
  - Ova klasa je odgovorna za generisanje JWT tokena. Uključuje korisničke informacije u `Claims` i koristi `JWT_SECRET_KEY` za potpisivanje tokena.

**Tok:**

1. `GenerateClaims` pravi skup podataka o korisniku koji će biti ubačeni u token.
2. `GenerateToken` pravi JWT koristeći te `Claims` i ključ iz konfiguracije (`JWT_SECRET_KEY`).







- **`UseAuthentication()` i `UseAuthorization()`** middleware komponente omogućavaju serveru da proveri validnost JWT tokena koji je poslat u Authorization header-u.

#### 

JWTSettings.cs
Ova klasa služi za čuvanje postavki vezanih za JWT autentifikaciju.

Kroz konstruktor, ona čita vrednosti iz environment varijabli (ili postavlja podrazumevane vrednosti).

Postavke koje se čuvaju uključuju:

- `JwtIssuer` (izdavalac JWT-a)
- `JwtAudience` (audijencija JWT-a)
- `JwtSecretKey` (tajni ključ za potpisivanje tokena)
- `TokenExpiryMinutes` (vreme isteka tokena, u minutima).



JWTManager.cs

Ova klasa je odgovorna za generisanje JWT tokena na osnovu korisničkog imena i lozinke.

`MakeToken`: Proverava korisnika na osnovu korisničkog imena i lozinke, generiše JWT tokene i vraća ga.

`GenerateClaims`: Kreira listu **claims** (potvrda o korisniku) koja se koristi za generisanje tokena.

`GenerateToken`: Kreira stvarni JWT token koristeći **signing credentials** i povratne **claims**.

Metoda `FetchUser` traži korisnika u bazi podataka na osnovu korisničkog imena i lozinke. Ako je korisnik pronađen, onda se generišu **claims** sa informacijama o korisniku.

Zatim se koristi `GenerateToken` metoda za generisanje JWT tokena, koji je potpisan sa tajnim ključem i postavljen sa različitim parametrima (issuer, audience, expiration).

**Sigurnost lozinke**: Kao i kod prethodne klase, lozinke ne bi trebalo da se čuvaju kao plain text. Upotrebite **hashing** (npr. bcrypt) da biste osigurali bezbednost.

**Token Expiry**: `DateTime.UtcNow.AddMinutes(120)` koristi hardkodiranu vrednost za vreme isteka. Bolje bi bilo koristiti `TokenExpiryMinutes` iz `JWTSettings`.

**Preporuka za refaktorisanje**: Metode za generisanje claims i generisanje tokena mogu biti izdvojene u zasebnu klasu ili servis za bolju čitljivost i testabilnost.

S obzirom na to da smo razdvojili generaciju tokena i claims u posebnu klasu (`JWTService`), sada ćete moći lakše da pišete testove za te komponente.

Takođe, sa ovom reorganizacijom, **`JWTManager`** je postao jednostavniji i sada je odgovoran samo za autentifikaciju korisnika (pronalazak korisnika u bazi), dok `JWTService` preuzima odgovornost za generisanje JWT tokena i claims.



JWTActor.cs
**Šta radi?**

- Reprezentuje korisničke podatke u JWT-u.
- Služi za prenos informacija o korisniku kao što su ID, ime, prezime, email, profilna slika, uloga, itd.









**`GenerateClaims(User user)`**

- Kreira `claims` koji će biti ubačeni u JWT payload.
- Problem: **Ne šifruješ ActorData!** Može biti ranjivo na napade (npr. ako napadač modifikuje token i dekodira podatke).



Kada koristiš JWT (JSON Web Token) za prenos podataka kao što je korisnički entitet (u ovom slučaju `ActorData`), ti podaci su deo samog tokena i mogu biti lako dekodirani od strane bilo koga ko ima pristup tokenu. Ako se podaci u tokenu ne šifruju (ili potpisuju), napadač može da modifikuje token, ponovo ga kodira i koristi za pristup sistemu kao drugi korisnik.





**AddApplicationActor**

Metoda `AddApplicationActor` dodaje uslugu koja se koristi za obezbeđivanje informacije o korisniku (ili "glumcu") koji je trenutno autentifikovan u aplikaciji. "Actor" ovde označava korisnički entitet ili ulogu koji obavlja određene akcije u aplikaciji, kao što su regularni korisnici ili administrator.

Glavni cilj: Ova metoda omogućava da aplikacija ima pristup informacijama o korisniku u bilo kojem delu koda gde je potrebno obraditi specifične privilegije ili uloge korisnika.

**JWT (JSON Web Token):** Tokeni koje koristi ova metoda obezbeđuju siguran način za prenos korisničkih podataka između servera i klijenta, a `ActorData` u tokenu sadrži specifične informacije o "glumcu" korisniku.

Ova linija dodaje implementaciju za interfejs `IApplicationActor` u DI (Dependency Injection) kontejner. `AddTransient` znači da će se nova instanca `IApplicationActor` kreirati svaki put kada se zatraži.

Ovaj kod uzima `IHttpContextAccessor` uslugu iz DI kontejnera. `IHttpContextAccessor` omogućava pristup HTTP kontekstu, koji sadrži podatke o trenutnoj HTTP zahtevnoj sesiji, kao što su korisnički podaci, zaglavlja i kolačići.

Ovde se pristupa `HttpContext.User`, koji predstavlja `ClaimsPrincipal` objekat sa svim informacijama o autentifikovanom korisniku, kao što su ID korisnika, rola, i druge tvrdnje (claims).

Ovaj deo koda proverava da li postoji "ActorData" tvrdnja (claim) u korisničkom tokenu. Ako ta tvrdnja ne postoji, to znači da korisnik nije ulogovan kao specifičan "glumac", pa se vraća instanca `AnonymousActor`, koji predstavlja anonimnog korisnika.

Ako "ActorData" postoji, njegov sadržaj se preuzima iz korisničkog tokena. Ovaj podatak je najverovatnije u JSON formatu i predstavlja specifične informacije o korisniku (npr. uloge, privilegije). Taj JSON string se zatim deserijalizuje u objekat `JWTActor`, koji verovatno sadrži relevantne informacije o korisniku.

Na kraju, metoda vraća instancu `JWTActor` (ili `AnonymousActor` ako nije autentifikovan), koji se koristi kasnije u aplikaciji da predstavlja trenutno ulogovanog korisnika i njegove privilegije.





Metoda `AddJWT` omogućava konfigurisanje JWT autentifikacije u ASP.NET aplikaciji. Ova konfiguracija uključuje:

- Registraciju potrebnih servisa za upravljanje i validaciju JWT tokena.
- Postavljanje parametara za autentifikaciju putem JWT Bearer sheme.
- Specifikaciju kako će se JWT token validirati, uključujući izdavača, publiku, potpis i rok trajanja.
- Događaj `OnMessageReceived` za hvatanje tokena iz query string-a, što može biti korisno u aplikacijama koje koriste SignalR ili druge tehnologije koje šalju tokene putem URL parametara.





APIExtension.cs
Sve metode u klasi **APIExtension** su **static** jer se radi o klasi koja definiše proširenja za **IServiceCollection** interfejs.

**LoadUseCases(IServiceCollection services):** Ova metoda je **extension method** koja se koristi za registrovanje svih use case-ova u aplikaciji. Use case-ovi obuhvataju komande (commands) i upite (queries) koji definišu funkcionalnosti koje aplikacija pruža. U ovoj metodi, use case-ovi se dodaju kao zavisnosti u Dependency Injection kontejner, tako da su kasnije dostupni za injektovanje u druge delove aplikacije.







**Startup** klasa se koristi za konfigurisanje servisa koje aplikacija koristi, kao i za konfigurisanje različitih delova aplikacije kao što su middleware-i, ruta, i sl.

Konstruktor prima IConfiguration objekat koji se koristi za čitanje konfiguracionih vrednosti aplikacije.

Metod **ConfigureServices**:
Ovaj metod se koristi za konfigurisanje servisa koje aplikacija koristi. Ovde se obično konfigurišu servisi za pristup podacima, servisi za autentifikaciju i autorizaciju, kao i servisi koji su specifični za aplikaciju.



**AddHttpContextAccessor** je ASP.NET Core ekstenzija koja se koristi za registraciju HttpContextAccessor servisa. Ovaj servis omogućava pristup trenutnom HTTP zahtevu unutar aplikacije.
 Kada se HttpContextAccessor registruje kao servis, može se ubrizgati u druge servise ili kontrolere u aplikaciji, omogućavajući im da pristupe informacijama o trenutnom HTTP zahtevu, kao što su URL, zaglavlja, sesija, identitet korisnika i druge korisne informacije.Na primer, možete koristiti HttpContextAccessor da biste pristupili informacijama o autentifikovanom korisniku ili da biste dobili trenutni URL za generisanje povratnih linkova. Ovo može biti korisno u različitim delovima aplikacije, kao što su filtri, servisi, kontroleri i tako dalje.Registracija HttpContextAccessor servisa pomaže u olakšavanju pristupa kontekstu HTTP zahteva i čini ga dostupnim unutar cele aplikacije gde god je potrebno.



Dodaje se podrška za Swagger dokumentaciju (AddSwaggerGen), gde se definiše verzija API-ja i opis njegovih funkcionalnosti. Takođe se dodaje definicija sigurnosne šeme za JWT autentifikaciju.



Metoda **Configure** je deo ASP.NET Core aplikacije i koristi se za konfigurisanje middleware komponenti koje se koriste za obradu HTTP zahteva. 

Ova metoda se poziva prilikom pokretanja aplikacije i konfiguriše middleware lanac za obradu HTTP zahteva. Svaki middleware dodaje specifičnu funkcionalnost koja se izvršava u okviru tog lanca, u skladu sa redosledom u kome su dodati.



CORS (Cross-Origin Resource Sharing) je bezbednosni mehanizam ugrađen u web pretraživače koji reguliše kako web aplikacije mogu da učitavaju resurse sa drugih domena. Po defaultu, pretraživači blokiraju zahteve koji dolaze sa različitih origin-a (domena, protokola ili porta) od onog na kojem aplikacija radi, osim ako server eksplicitno dozvoli takve zahteve putem CORS podešavanja.

CORS politika je definisana u metodi `ConfigureServices(IServiceCollection services)` unutar `Startup` klase

A zatim se primenjuje u metodi `Configure(IApplicationBuilder app, IWebHostEnvironment env)`



#### **`WithOrigins("http://localhost:5173")`**

- Ovim server dozvoljava HTTP zahteve samo sa `http://localhost:5173`.
- To znači da ako frontend aplikacija radi na `http://localhost:5173`, ona može slati zahteve ka ovom API-ju.
- Zahtevi sa drugih origin-a (npr. `http://example.com`) će biti blokirani.

#### **. `AllowAnyMethod()`**

- Omogućava bilo koji HTTP metod (`GET`, `POST`, `PUT`, `DELETE`, itd.).
- Ako se ovo ne postavi, API može odbiti metode koje nisu eksplicitno dozvoljene.



#### **`AllowAnyHeader()`**

- Omogućava bilo koji HTTP header u zahtevima.
- To znači da klijentska aplikacija može slati `Authorization`, `Content-Type`, `X-Custom-Header`, itd.

#### **`AllowCredentials()`**

- Dozvoljava slanje `cookies`, `Authorization` zaglavlja i drugih poverljivih informacija u zahtevu.
- **Napomena**: Ako koristiš `AllowCredentials()`, ne možeš koristiti `AllowAnyOrigin()`, već moraš eksplicitno navesti dozvoljeni origin (`WithOrigins(...)`).



**Simple Requests (jednostavni zahtevi)**

- Ako je zahtev jednostavan (`GET` ili `POST`, bez custom header-a), server će odgovoriti kao i obično.
- Pretraživač će proveriti `Access-Control-Allow-Origin` header u odgovoru i odlučiti da li će dozvoliti odgovor aplikaciji.

**Preflight Requests (prethodni upit)**

- Ako zahtev koristi `PUT`, `DELETE`, `PATCH` ili sadrži specijalne zaglavlja (`Authorization`, `Content-Type: application/json` itd.), pretraživač prvo šalje `OPTIONS` zahtev na server.
- Server odgovara sa `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers` i `Access-Control-Allow-Origin`.
- Ako je odgovor validan, pretraživač nastavlja sa pravim zahtevom.



Problem:

- Ti **prvo hashiraš lozinku koju korisnik pošalje**, ali onda pokušavaš direktno da je uporediš sa onim što je u bazi.

Umesto da proveravaš lozinku u SQL upitu, treba da **prvo dohvatiš korisnika pomoću username-a**, a zatim koristiš `BCrypt.Verify` za proveru lozinke.

Prvo tražimo korisnika samo po `username`.

Ako korisnik **ne postoji**, vraćamo `null`.

Ako korisnik postoji, **koristimo `BCrypt.Verify`** da uporedimo ne-hashiranu lozinku koju je korisnik uneo sa hashiranom lozinkom iz baze.

However, because the password is hashed again in the LoginController before being sent to FetchUser, you're not comparing the user's plain text password to the stored hash; instead, you're comparing one bcrypt hash to another bcrypt hash, which will always fail because bcrypt hashes are designed to be unique even for the same input.







Tvoj **`AuthorRequestsController`** je ASP.NET Core Web API kontroler koji omogućava rad sa zahtevima za autorstvo (verovatno na nekoj platformi gde korisnici mogu tražiti da postanu autori). Hajde da ga analiziramo deo po deo.

Ovaj API omogućava upravljanje zahtevima autora. Korisnici mogu kreirati nove zahteve, pregledati postojeće zahteve i prihvatiti ili odbiti zahteve.

Kontroler služi kao **most između HTTP zahteva i aplikacione logike**. Njegova svrha je:

- Prijem HTTP zahteva
- Validacija podataka
- Prosleđivanje podataka servisima / komandama
- Vraćanje odgovarajućih HTTP odgovora

## 📌 **Zavisnosti u konstruktoru**

- **`UseCaseExecutor _executor`** – Ovaj objekat se koristi za izvršavanje **komandi i upita** unutar aplikacije. To omogućava **separaciju odgovornosti** i centralizuje izvršavanje use-case logike.
- **`IApplicationActor _actor`** – Ovo predstavlja trenutno prijavljenog korisnika koji šalje zahtev. Kroz njega možemo saznati **ID i uloge korisnika**.

> Ovo je DI (Dependency Injection), gde ASP.NET Core ubacuje zavisnosti umesto nas.





Ove atribute koristi ASP.NET Core da bi znao **odakle da dobije podatke**:

| Atribut              | Odakle dolaze podaci?                       | Primer                                |
| -------------------- | ------------------------------------------- | ------------------------------------- |
| **`[FromBody]`**     | Iz **tela HTTP zahteva (JSON body)**        | `POST`, `PUT` zahtevi                 |
| **`[FromQuery]`**    | Iz **query stringa u URL-u**                | `GET /api/authorrequests?reason=spam` |
| **`[FromServices]`** | Iz **Dependency Injection (DI) kontejnera** | Servisi, komande                      |



## 📌 **Obrada kreiranja zahteva za autora (`POST`)**

- Prima **DTO objekat** iz body-ja (`[FromBody] UpsertAuthorRequestDto dtoRequest`).
- Prima komandu za kreiranje iz DI kontejnera (`[FromServices] ICreateAuthorRequestCommand command`).
- Automatski postavlja `IdUser` na ID trenutno prijavljenog korisnika.
- **Poziva `_executor.ExecuteCommand()`**, što znači da delegira posao komandi.
- Vraća **`200 OK`** odgovor sa podacima.

💡 **Zašto `FromServices` za komandu?**
Zato što je `ICreateAuthorRequestCommand` servis koji ASP.NET Core može automatski ubaciti kroz Dependency Injection.



## 📌 **Dobavljanje zahteva (`GET`)**

**Prima upit (`query`) iz DI kontejnera** (`FromServices`).

**Prima parametre pretrage (`search`) iz query stringa** (`FromQuery`).

Poziva `_executor.ExecuteQuery()` da vrati rezultat.



## 📌 **Prihvatanje zahteva (`PUT /accept`)**

**Prima ID iz query stringa** (`[FromQuery] int id`).

**Prima telo zahteva (`[FromBody] UpsertAuthorRequestDto`)**.

**Menja ulogu na `2` (verovatno 'Autor')**.

Poziva `_executor.ExecuteCommand()`, koji izvršava komandu.



## 📌 **Zašto svuda `UseCaseExecutor`?**

- **Omogućava centralizovano izvršavanje use-case-ova**.
- Umesto da direktno pozivamo metode komande, koristimo **Executor Pattern**.
- Može sadržati **dodatne provere (npr. da li korisnik ima pravo na ovu akciju)**.

💡 **Prednost**: Ako sutra promeniš način izvršavanja (dodaješ logovanje, error handling, transakcije), menjaš samo `UseCaseExecutor`.



## 📌 **Zašto `IApplicationActor`?**

- Omogućava **identifikaciju trenutnog korisnika**.
- **Sprečava korisnika da menja `IdUser` ručno**.
- Može se koristiti za **autorizaciju** – npr. admini mogu videti sve zahteve, a obični korisnici samo svoje.



## 📌 **Zaključak**

✅ **`AuthorRequestsController`** je dobro organizovan i koristi nekoliko važnih principa:
🔹 **Separation of Concerns** – Kontroler ne sadrži poslovnu logiku, već je prosleđuje komandama.
🔹 **Dependency Injection** – Servisi i komande se ubrizgavaju, što omogućava lakšu izmenu.
🔹 **UseCaseExecutor Pattern** – Omogućava centralizovano izvršavanje komandi/upita.
🔹 **Autentifikacija** – Korisnik ne može lažirati `IdUser` jer dolazi iz `IApplicationActor`.









UsersController

Da, **obrada slika korisnika treba da bude izdvojena u poseban servis** iz sledećih razloga:

### 📌 **Problemi trenutne implementacije**

1. **Prekršaj Single Responsibility Principa (SRP)**
   - `UsersController` bi trebalo da se bavi **samo upravljanjem korisnicima**.
   - Trenutno sadrži logiku za **učitavanje slika**, što nije njegova osnovna odgovornost.



**Bolja organizacija i lakoća održavanja**

- Servis može podržati različite storage opcije (lokalni disk, cloud, baza podataka).
- Kasnije možeš dodati **keširanje slika** radi poboljšanja performansi.





PUT kod usera vraca odmah usera Kada frontend **mora odmah da vidi update-ovane podatke**, a ne da osvežava stranicu.

















Tvoj `ImagesController` obavlja tri glavne funkcionalnosti:

1. **Upload slike (`POST /api/images`)** – Prima sliku i čuva je u `wwwroot/Images` direktorijumu, zatim snima putanju u bazu.
2. **Prikaz slike (`GET /api/images/{image-name}`)** – Čita sliku iz `wwwroot/Images` i vraća je kao HTTP odgovor.
3. **Proxy zahtevi za slike (`POST` i `GET /api/images/proxy`)** – Dohvata sliku sa eksterne URL adrese i vraća je kao HTTP odgovor.

### 1️⃣ **Upload slike (`POST /api/images`)**

✅ **Šta radi ispravno?**
✔ Generiše jedinstveno ime fajla pomoću `Guid.NewGuid()`.
✔ Čuva sliku u `wwwroot/Images`.
✔ Koristi `Path.Combine()` kako bi bio OS-independent.
✔ Kreira direktorijum ako ne postoji (`Directory.CreateDirectory(uploadsFolder)`).
✔ Snima putanju slike u bazu podataka.

⚠ **Problemi i poboljšanja:**
❌ **Ne validira veličinu i tip fajla** – Korisnik može uploadovati bilo šta, što je **sigurnosni rizik**.
✅ **Rešenje:** Proveriti **mime-type** i **ekstenziju** pre snimanja.







### **Dohvatanje slike (`GET /api/images/{image-name}`)**

✅ **Šta radi ispravno?**
✔ Učitava sliku iz `wwwroot/Images`.
✔ Vraća `File` HTTP odgovor sa **mime-type** `image/jpeg`.

⚠ **Problemi i poboljšanja:**
❌ **Ne proverava da li slika postoji pre nego što pokuša da je pročita** → baca `FileNotFoundException`.
✅ **Rešenje:** Proveriti `File.Exists(imagePath)` pre nego što se fajl pročita.
💡 **Dodatni feature:** Mime-type treba određivati dinamički (trenutno vraća samo `image/jpeg`).





###  **Proxy za slike (`GET` i `POST /api/images/proxy`)**

✅ **Šta radi ispravno?**
✔ Šalje HTTP zahtev ka eksternoj slici.
✔ Proverava da li je vraćeni sadržaj **validna slika**.
✔ Dodaje `User-Agent` kako bi izbegao blokiranje od strane servera.



**Dodati keširanje – preuzeti sliku i sačuvati lokalno**.

**Blokirati sumnjive URL-ove** (npr. slike sa nepoznatih sajtova).



Keširane slike možemo čuvati i na disku (`wwwroot/ProxyImages`) kako bismo ih kasnije koristili bez potrebe za ponovnim preuzimanjem.

**Generišemo hash od URL-a** kako bismo dobili jedinstveni naziv fajla.

**Proveravamo da li keširana slika već postoji** u `"wwwroot/ProxyImages"`.

Ako **postoji**, vraćamo je direktno.

Ako **ne postoji**, preuzimamo sliku, **čuvamo je na disku** i vraćamo klijentu.









UseCaseLogs

#### **1. UseCaseLogsController (Kontroler)**

Kontroler `UseCaseLogsController` je API endpoint koji omogućava pretragu i dohvat logova o korišćenju Use Case-ova. Ključne tačke:

- **Ruta:** `api/usecaselogs`
- **Zavisi od:** `UseCaseExecutor` za izvršavanje upita (`query`).
- Metod `Get`
  - Prima `UseCaseLogSearch` objekat iz query parametara (filtracija i paginacija).
  - Prima `IGetUseCaseLogsQuery` iz DI-a kao servis.
  - Poziva `_executor.ExecuteQuery(query, search)`, što znači da koristi `UseCaseExecutor` za izvršavanje upita nad bazom.
  - Vraća rezultate u `Ok(response)` formatu.

#### **2. EFGetUseCaseLogsQuery (Query - Implementacija)**

Ovo je implementacija query-a koji dohvaća podatke iz baze (`BlogContext`) i filtrira ih prema zadatim parametrima.

- **Nasleđuje `IGetUseCaseLogsQuery`**.
- Filtracija na osnovu:
  - `Actor` (koji korisnik je izvršio akciju).
  - `UseCaseName` (ime Use Case-a).
  - `DateFrom` i `DateTo` (vremenski period).
- **Sortiranje** prema `Date`, podrazumevano opadajuće (`desc`).
- **Paginacija** pomoću `Page` i `PerPage`.
- **Selektuje podatke** u `GetUseCaseLogDto` DTO.

#### **3. UseCaseLogSearch (Search DTO)**

Ovaj objekat modeluje parametre pretrage za logove:

- **Nasleđuje `PagedSearch`**, što znači da uključuje paginaciju (`Page` i `PerPage`).
- Filteri
  - `Actor`
  - `UseCaseName`
  - `DateFrom` (podrazumevana vrednost `DateTime.MinValue` - najraniji datum).
  - `DateTo` (podrazumevana vrednost `DateTime.MaxValue` - najkasniji datum).
  - `SortOrder` (`"desc"` podrazumevano).

API endpoint `GET api/usecaselogs` omogućava pretragu Use Case logova.

Query `EFGetUseCaseLogsQuery` vrši pretragu, filtraciju, sortiranje i paginaciju.

`UseCaseLogSearch` definiše kako se logovi pretražuju.





CategoriesController

Ovaj kontroler omogućava CRUD operacije nad kategorijama putem REST API-a. Koristi `UseCaseExecutor` za izvršavanje komandi i upita, čime se primenjuje **CQRS (Command Query Responsibility Segregation)** princip.

- **Ruta:** `api/categories`
- **Nasleđuje:** `ControllerBase`
- **Koristi:** `UseCaseExecutor` za izvršavanje komandi (`Command`) i upita (`Query`).
- Podržane operacije:
  - **Kreiranje kategorije** (`POST`)
  - **Preuzimanje liste kategorija** (`GET`)
  - **Preuzimanje jedne kategorije** (`GET {id}`)
  - **Izmena kategorije** (`PUT {id}`)
  - **Brisanje kategorije** (`DELETE {id}`)



POST Prima `UpsertCategoryDto` iz tela zahteva.

Koristi `ICreateCategoryCommand` da izvrši komandu kreiranja kategorije.

Vraća **201 Created** status ako je uspešno kreirana

GET Koristi `IGetCategoriesQuery` za dohvat kategorija iz baze.

**Filtrira rezultate** koristeći `CategorySearch`.

Vraća listu kategorija u `200 OK` odgovoru.

GET Prima `id` kategorije iz URL-a.

Kreira `CategorySearch` objekat sa **paginacijom** (`Page` i `PerPage`).

Koristi `IGetCategoryQuery` da pronađe kategoriju.

Vraća podatke o kategoriji u `200 OK`.

PUT Prima `id` kategorije iz URL-a i podatke iz tela zahteva (`UpsertCategoryDto`).

Postavlja `Id` u DTO objektu (za sigurnost).

Izvršava `IUpdateCategoryCommand` za ažuriranje kategorije.

**Vraća `204 No Content`** ako je izmena uspešna.

DELETE Prima `id` kategorije iz URL-a.

Izvršava `IDeleteCategoryCommand` za brisanje.

**Vraća `204 No Content`** ako je uspešno obrisana.

📌 **CategoriesController** omogućava rad sa kategorijama koristeći **CQRS** princip.
✅ **Kreiranje, pretraga, ažuriranje i brisanje kategorija** su jasno razdvojeni putem komandi i upita.
🛠 **UseCaseExecutor** upravlja izvršavanjem komandi/upita, što olakšava upravljanje logikom aplikacije.





FollowersController
Ovaj kontroler omogućava upravljanje praćenjem korisnika (**follow/unfollow**) i preuzimanje liste pratioca i praćenih korisnika. Koristi **CQRS** princip, razdvajajući komande (`Command`) i upite (`Query`).

**Ruta:** `api/followers`

**Nasleđuje:** `ControllerBase`

**Zavisi od:**

- `UseCaseExecutor` – izvršava komande i upite.
- `IApplicationActor` – daje ID trenutno prijavljenog korisnika.

**Podržane operacije:**

- **Praćenje korisnika** (`POST`)
- **Dohvatanje liste pratilaca** (`GET {id}/followers`)
- **Dohvatanje liste korisnika koje korisnik prati** (`GET {id}/following`)
- **Prekid praćenja korisnika** (`DELETE {id}/unfollow`)
- **Provera da li korisnik prati drugog korisnika** (`GET {id}/check`)

POST **Prima `InsertFollowDto`** – DTO sa podacima o korisniku koji se prati.

**Postavlja `IdUser` na prijavljenog korisnika** (`_actor.Id`).

**Poziva `IFollowCommand` asinhrono** (`ExecuteCommandAsync`) da doda vezu u bazu.

**Vraća `200 OK` ako je uspešno.**

GET **Prima `id` korisnika** iz URL-a.

**Koristi `IGetFollowersQuery`** da pronađe sve koji prate tog korisnika.

**Koristi `FollowSearch`** za filtraciju i paginaciju.

**Vraća listu pratilaca u `200 OK`.**

GET **Prima `id` korisnika** iz URL-a.

**Koristi `IGetFollowingQuery`** da pronađe sve koje taj korisnik prati.

**Koristi `FollowSearch`** za filtraciju i paginaciju.

DELETE 

- **Prima `id` korisnika** koji se otprati.
- **Izvršava `IUnfollowCommand`** da ukloni vezu praćenja iz baze.
- **Vraća `200 OK` ako je uspešno.**

GET 

- **Prima `id` korisnika** koji se proverava.
- **Koristi `ICheckFollowStatusQuery`** da proveri status praćenja.
- **Vraća `true` ili `false` unutar JSON objekta** (`{ "isFollowing": true/false }`).



📌 **FollowersController** omogućava rad sa praćenjem korisnika koristeći **CQRS** princip.
✅ **Korisnici mogu pratiti, otpratiti, videti listu pratilaca i proveriti status praćenja.**
⚡ **Asinhrono izvršavanje (`Task`) koristi se za `POST` da poboljša performanse.**
🔒 **`IApplicationActor.Id` osigurava da korisnik može pratiti samo u svoje ime.**







CommentsController

Ovaj kontroler omogućava rad sa komentarima i lajkovima na komentare. Koristi **CQRS** princip (razdvajanje upita i komandi).

## **Opšti pregled**

- **Ruta:** `api/comments`
- **Nasleđuje:** `ControllerBase`
- Zavisi od:
  - `UseCaseExecutor` – izvršava komande i upite.
  - `IApplicationActor` – dohvaća ID trenutno prijavljenog korisnika.
- Podržane operacije:
  - **Dodavanje komentara** (`POST`)
  - **Dohvatanje svih komentara** (`GET`)
  - **Dohvatanje jednog komentara** (`GET {id}`)
  - **Ažuriranje komentara** (`PUT {id}`)
  - **Brisanje komentara** (`DELETE {id}`)
  - **Lajkovanje komentara** (`POST {id}/like`)
  - **Brisanje ličnog komentara** (`DELETE {id}/personal`)

POST **Prima `UpsertCommentDto`** – DTO sa podacima o komentaru.

**Izvršava `ICreateCommentCommand` asinhrono** (`ExecuteCommandAsync`).

**Vraća podatke o kreiranom komentaru (`200 OK`).**

GET 

- **Koristi `IGetCommentsQuery`** za dohvat komentara.
- **Prima `CommentSearch`** za filtraciju i paginaciju.
- **Vraća listu komentara u `200 OK`.**

GET 

- **Prima `id` komentara** iz URL-a.
- **Koristi `IGetCommentQuery`** da pronađe komentar.
- **Vraća komentar u `200 OK`.**

PUT 

- **Prima `id` komentara** iz URL-a.
- **Postavlja `Id` i `IdUser`** kako bi osigurao da korisnik ažurira samo svoje komentare.
- **Koristi `IUpdatePersonalCommentCommand`** za ažuriranje.
- **Vraća `204 No Content` ako je uspešno.**

DELETE **Prima `id` komentara** iz URL-a.

**Koristi `IDeleteCommentCommand`** za brisanje komentara.

**Vraća `204 No Content` ako je uspešno.**

Like, POST 

- **Prima `LikeDto`** – DTO za lajk podatke.
- **Izvršava `ILikeCommentCommand` asinhrono** (`ExecuteCommandAsync`).
- **Vraća `200 OK` sa podacima o lajku.**

DELETE 

- **Prima `id` komentara** iz URL-a.
- **Koristi `IDeletePersonalCommentCommand`** da obriše komentar koji pripada prijavljenom korisniku.
- **Vraća `204 No Content` ako je uspešno.**

📌 **`CommentsController`** omogućava CRUD operacije nad komentarima i lajkovima.
✅ **Korisnici mogu dodavati, menjati i brisati samo svoje komentare.**
⚡ **Koristi asinhrono izvršavanje za kreiranje komentara i lajkovanje (`Task`).**
🔒 **`IApplicationActor.Id` osigurava da korisnik može uređivati samo svoje komentare.**









**Vraćaj odgovarajuće HTTP status kodove**

- `200 OK` → Kada uspešno dohvatiš podatke
- `201 Created` → Kada kreiraš novi resurs
- `204 No Content` → Kada uspešno ažuriraš ili obrišeš, a nema sadržaja za vratiti
- `400 Bad Request` → Kada su podaci u zahtevu neispravni
- `401 Unauthorized` → Kada korisnik nije autentifikovan
- `403 Forbidden` → Kada korisnik nema prava pristupa
- `404 Not Found` → Kada resurs ne postoji
- `500 Internal Server Error` → Kada dođe do nepredviđene greške





**Kada vratiti rezultat?**
✅ Uvek, osim ako se očekuje `404 Not Found` (npr. ako ID ne postoji).
**Status kodovi:**

- `200 OK` → Kada je upit uspešan i podaci su pronađeni.
- `404 Not Found` → Kada traženi entitet ne postoji.

**Kada vratiti rezultat?**
✅ Poželjno je vratiti kreirani resurs ili `201 Created`.
**Status kodovi:**

- `201 Created` → Kada je resurs uspešno kreiran.
- `400 Bad Request` → Kada su podaci nevalidni.

**Kada vratiti rezultat?**
✅ Ako uspe, samo `204 No Content`.
❌ Ne treba vraćati ažurirani objekat – klijent već zna šta je poslao.
**Status kodovi:**

- `204 No Content` → Kada je ažuriranje uspešno.
- `400 Bad Request` → Kada podaci nisu validni.
- `404 Not Found` → Kada entitet ne postoji.

**Kada vratiti rezultat?**
✅ Samo statusni kod (`204 No Content`).
❌ Ne vraćati potvrdu u telu odgovora.
**Status kodovi:**

- `204 No Content` → Kada je resurs uspešno obrisan.
- `404 Not Found` → Kada resurs ne postoji.



### **Operacije poput "Like" ili "Follow"**

**Kada vratiti rezultat?**
✅ `200 OK` ako je akcija uspešna i ako ima smisla vratiti neki podatak.
✅ `201 Created` ako se kreira novi entitet (npr. novi zapis u bazi).
**Status kodovi:**

- `200 OK` → Ako operacija ne kreira novi entitet (npr. "Like" dugme).
- `201 Created` → Ako se kreira novi zapis (npr. novi "Follow" zapis u bazi).



### **Koristi `FromServices` za injektovane zavisnosti**

Umesto **constructor injection-a** za komande, koristi `[FromServices]`:

➡ Ovo sprečava nepotrebno pravljenje servisa ako metoda nije pozvana.

✔ **Konzistentno koristi odgovarajuće HTTP metode i statusne kodove.**
✔ **Ne vraćaj podatke tamo gde nisu potrebni (npr. `PUT`, `DELETE`).**
✔ **Koristi validaciju i globalno rukovanje greškama.**
✔ **Koristi asinhrono izvršavanje (`Task<IActionResult>`) za upite i komande koje pristupaju bazi.**

➡ **Cilj:** API treba biti **predvidiv**, **konzistentan** i **lak za korišćenje!** 🚀











- **Ruta:** `api/comments`

- **Nasleđuje:** `ControllerBase`

- Zavisi od:
  - `UseCaseExecutor` – izvršava komande i upite.
  - `IApplicationActor` – dohvaća ID trenutno prijavljenog korisnika.
  
- Podržane operacije:
  - **Dodavanje komentara** (`POST`)
  - **Dohvatanje svih komentara** (`GET`)
  - **Dohvatanje jednog komentara** (`GET {id}`)
  - **Ažuriranje komentara** (`PUT {id}`)
  - **Brisanje komentara** (`DELETE {id}`)
  - **Lajkovanje komentara** (`POST {id}/like`)
  - **Brisanje ličnog komentara** (`DELETE {id}/personal`)

POST **Prima `UpsertCommentDto`** – DTO sa podacima o komentaru.

**Izvršava `ICreateCommentCommand` asinhrono** (`ExecuteCommandAsync`).

**Vraća podatke o kreiranom komentaru (`200 OK`).**

GET 

- **Koristi `IGetCommentsQuery`** za dohvat komentara.
- **Prima `CommentSearch`** za filtraciju i paginaciju.
- **Vraća listu komentara u `200 OK`.**

GET 

- **Prima `id` komentara** iz URL-a.
- **Koristi `IGetCommentQuery`** da pronađe komentar.
- **Vraća komentar u `200 OK`.**

PUT 

- **Prima `id` komentara** iz URL-a.
- **Postavlja `Id` i `IdUser`** kako bi osigurao da korisnik ažurira samo svoje komentare.
- **Koristi `IUpdatePersonalCommentCommand`** za ažuriranje.
- **Vraća `204 No Content` ako je uspešno.**

DELETE **Prima `id` komentara** iz URL-a.

**Koristi `IDeleteCommentCommand`** za brisanje komentara.

**Vraća `204 No Content` ako je uspešno.**

Like, POST 

- **Prima `LikeDto`** – DTO za lajk podatke.
- **Izvršava `ILikeCommentCommand` asinhrono** (`ExecuteCommandAsync`).
- **Vraća `200 OK` sa podacima o lajku.**

DELETE 

- **Prima `id` komentara** iz URL-a.
- **Koristi `IDeletePersonalCommentCommand`** da obriše komentar koji pripada prijavljenom korisniku.
- **Vraća `204 No Content` ako je uspešno.**

📌 **`CommentsController`** omogućava CRUD operacije nad komentarima i lajkovima.
✅ **Korisnici mogu dodavati, menjati i brisati samo svoje komentare.**
⚡ **Koristi asinhrono izvršavanje za kreiranje komentara i lajkovanje (`Task`).**
🔒 **`IApplicationActor.Id` osigurava da korisnik može uređivati samo svoje komentare.**





2. **<u>Client</u>** Sadrži korisnički interfejs, što može biti web aplikacija (HTML, CSS, JavaScript) ili čak kompletan front-end projekat baziran na modernim frejmvorcima. Ovaj sloj je dizajniran da komunicira sa API slojem.

