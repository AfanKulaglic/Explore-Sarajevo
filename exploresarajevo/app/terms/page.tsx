import LegalLayout, { LegalSection } from "../components/LegalLayout";

export default function UsloviKoristenjaPage() {
  return (
    <LegalLayout
      title="Uslovi korištenja"
      subtitle="Pravila korištenja platforme Explore Sarajevo."
      eyebrow="Terms · Of Use"
    >
      <LegalSection number="01" title="Prihvaćanje uslova">
        <p>
          Dobrodošli na platformu <strong>Explore Sarajevo</strong>.
          Korištenjem naše web stranice i povezanih servisa prihvatate ove
          Uslove korištenja. Ako se ne slažete sa ovim uslovima, molimo vas da
          ne koristite platformu.
        </p>
        <p>
          Explore Sarajevo razvija i održava{" "}
          <strong>Saraya Solutions</strong> iz Sarajeva.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Šta je Explore Sarajevo">
        <p>
          Explore Sarajevo je digitalna platforma koja preporučuje{" "}
          <strong>mjesta za posjetu i stvari koje možete raditi</strong> u
          Sarajevu i okolini. Platforma organizuje sadržaj kroz:
        </p>
        <ul>
          <li>
            <strong>Atrakcije</strong> — nekomercijalna mjesta od javnog
            interesa
          </li>
          <li>
            <strong>Poslovnice</strong> — komercijalna mjesta (restorani,
            kafići, hoteli)
          </li>
          <li>
            <strong>Događaje</strong> — vremenski ograničene aktivnosti
          </li>
        </ul>
      </LegalSection>

      <LegalSection number="03" title="Korištenje platforme">
        <p>
          Kao korisnik platforme obavezujete se da ćete je koristiti u skladu
          sa važećim zakonima. To podrazumijeva da nećete:
        </p>
        <ul>
          <li>zloupotrebljavati platformu u nezakonite svrhe</li>
          <li>pokušavati tehnički kompromitovati sigurnost sistema</li>
          <li>slati spam ili neželjene poruke</li>
          <li>objavljivati uvredljive ili nezakonite sadržaje</li>
        </ul>
      </LegalSection>

      <LegalSection number="04" title="Sadržaj na platformi">
        <p>
          Informacije o mjestima prikupljamo iz javno dostupnih izvora,
          partnera i interno uređenih opisa. Trudimo se da informacije budu
          tačne, ali ne možemo garantovati da su sve informacije u svakom
          trenutku potpuno tačne (npr. promjene radnog vremena, cijena, itd.).
        </p>
        <p>
          Explore Sarajevo u pravilu nije vlasnik atrakcija, poslovnica niti
          organizator događaja koji su prikazani na platformi.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Komercijalni i sponzorisani sadržaj">
        <p>Explore Sarajevo ostvaruje prihod kroz:</p>
        <ul>
          <li>premium i istaknute liste</li>
          <li>sponzorisane pozicije na početnoj stranici</li>
          <li>posebne sekcije i pakete vidljivosti</li>
        </ul>
        <p>
          Sponzorisani sadržaji mogu biti označeni kao takvi kada je to
          primjenjivo. Uvjeti komercijalne saradnje definišu se posebnim
          ugovorom.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Intelektualno vlasništvo">
        <p>
          Dizajn platforme, struktura sistema, tekstovi, vizuelni elementi, kao
          i brend <strong>Explore Sarajevo</strong> zaštićeni su pravima
          intelektualnog vlasništva i ne smiju se kopirati bez naše prethodne
          saglasnosti.
        </p>
      </LegalSection>

      <LegalSection number="07" title="Ograničenje odgovornosti">
        <p>
          Explore Sarajevo nije odgovoran za bilo kakvu direktnu ili indirektnu
          štetu koja može nastati korištenjem platforme ili posjetom mjesta
          prikazanih na platformi.
        </p>
        <p>
          Preporučujemo da prije posjete uvijek provjerite najnovije
          informacije direktno sa organizatorom ili poslovnicom.
        </p>
      </LegalSection>

      <LegalSection number="08" title="Izmjene uslova i kontakt">
        <p>
          Zadržavamo pravo da povremeno izmijenimo ove Uslove korištenja. Nova
          verzija stupa na snagu objavom na ovoj stranici.
        </p>
        <p>
          Pitanja možete poslati putem stranice <a href="/contact">Kontakt</a>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
