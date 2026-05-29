import LegalLayout, { LegalSection } from "../components/LegalLayout";

export default function KolaciciPage() {
  return (
    <LegalLayout
      title="Kolačići"
      subtitle="Kako i zašto koristimo kolačiće na Explore Sarajevo."
      eyebrow="Cookies · Policy"
    >
      <LegalSection number="01" title="Šta su kolačići?">
        <p>
          Kolačići su male tekstualne datoteke koje se pohranjuju na vaš uređaj
          kada posjetite web stranicu. Oni omogućavaju da stranica prepozna vaš
          uređaj, zapamti određene postavke i poboljša vaše korisničko
          iskustvo.
        </p>
        <p>
          Na platformi <strong>Explore Sarajevo</strong> koristimo kolačiće
          prvenstveno kako bismo osigurali pravilno funkcionisanje stranice i
          razumjeli kako korisnici koriste naš sadržaj.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Ko postavlja kolačiće?">
        <p>Kolačići na Explore Sarajevo mogu biti:</p>
        <ul>
          <li>
            <strong>Kolačići prve strane</strong> — koje postavlja direktno naša
            platforma
          </li>
          <li>
            <strong>Kolačići trećih strana</strong> — koje mogu postaviti naši
            provajderi usluga (npr. ugrađene mape, analitika)
          </li>
        </ul>
      </LegalSection>

      <LegalSection number="03" title="Vrste kolačića">
        <h3>Neophodni kolačići</h3>
        <p>
          Ovi kolačići su neophodni za osnovno funkcionisanje web stranice i ne
          mogu se isključiti u našim sistemima.
        </p>

        <h3>Funkcionalni kolačići</h3>
        <p>
          Funkcionalni kolačići omogućavaju da zapamtimo određene odabire i
          postavke (npr. jezik interfejsa).
        </p>

        <h3>Analitički kolačići</h3>
        <p>
          Analitički kolačići pomažu nam da razumijemo kako se platforma koristi
          — koje stranice se najviše posjećuju, koliko dugo korisnici ostaju na
          njima.
        </p>

        <h3>Marketinški i sponzorisani sadržaji</h3>
        <p>
          U slučaju prikaza sponzorisanog ili partnerskog sadržaja, mogu se
          koristiti dodatni kolačići ili oznake trećih strana. Kada takvi
          kolačići budu korišteni, jasno ćemo vas o tome informisati.
        </p>
      </LegalSection>

      <LegalSection number="04" title="Kako možete upravljati kolačićima">
        <p>
          Većina web pretraživača omogućava da sami podesite kako se kolačići
          koriste. Možete:
        </p>
        <ul>
          <li>blokirati kolačiće</li>
          <li>izbrisati postojeće kolačiće</li>
          <li>podesiti da vas pretraživač obavijesti prije pohrane kolačića</li>
        </ul>
        <p>
          Imajte na umu da isključivanje određenih kolačića može uticati na
          funkcionisanje platforme.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Odnos sa Politikom privatnosti">
        <p>
          Informacije koje prikupljamo putem kolačića ponekad mogu predstavljati
          lične podatke. U tom slučaju primjenjuju se i pravila iz naše{" "}
          <a href="/privacy">Politike privatnosti</a>.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Izmjene i kontakt">
        <p>
          Politiku kolačića možemo povremeno ažurirati. Najnovija verzija je
          uvijek dostupna na ovoj stranici.
        </p>
        <p>
          Ako imate pitanja, kontaktirajte nas putem stranice{" "}
          <a href="/contact">Kontakt</a>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
