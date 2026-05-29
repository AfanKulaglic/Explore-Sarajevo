import LegalLayout, { LegalSection } from "../components/LegalLayout";

export default function PolitikaPrivatnostiPage() {
  return (
    <LegalLayout
      title="Politika privatnosti"
      subtitle="Zaštita vaše privatnosti nam je važna."
      eyebrow="Privacy · Policy"
    >
      <LegalSection number="01" title="Uvod">
        <p>
          Ova Politika privatnosti objašnjava kako Explore Sarajevo prikuplja,
          koristi i štiti lične podatke korisnika platforme{" "}
          <strong>Explore Sarajevo</strong> (web stranica i povezani servisi).
          Kada koristite našu platformu, prihvatate pravila opisana u ovoj
          Politici.
        </p>
        <p>
          Explore Sarajevo razvija i održava{" "}
          <strong>Saraya Solutions</strong> iz Sarajeva (u nastavku: „mi“,
          „nas“, „naša platforma“). Trudimo se da vaše podatke obrađujemo
          transparentno, sigurno i samo u svrhe koje su vam jasno objašnjene.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Koje podatke prikupljamo">
        <h3>Podaci koje nam sami dostavite</h3>
        <p>
          Kada nas kontaktirate putem kontakt forme, emaila ili drugih kanala,
          možemo prikupljati:
        </p>
        <ul>
          <li>ime i prezime</li>
          <li>email adresu</li>
          <li>broj telefona (ako ga ostavite)</li>
          <li>naziv poslovnice ili organizacije</li>
          <li>sadržaj vaše poruke i eventualne dodatne informacije</li>
        </ul>

        <h3>Podaci o korištenju platforme</h3>
        <p>
          Kada koristite Explore Sarajevo, možemo prikupljati tehničke i
          analitičke podatke, kao što su:
        </p>
        <ul>
          <li>IP adresa (skraćena ili anonimizirana gdje je moguće)</li>
          <li>informacije o uređaju i pretraživaču</li>
          <li>stranice koje posjećujete i vrijeme provedeno na njima</li>
          <li>približna lokacija (na nivou grada/regiona, gdje je primjenjivo)</li>
        </ul>
        <p>
          Ove podatke koristimo prvenstveno za statistiku, sigurnost sistema i
          unapređenje korisničkog iskustva.
        </p>

        <h3>Podaci o poslovnicama, atrakcijama i događajima</h3>
        <p>
          Za <strong>Atrakcije, Poslovnice i Događaje</strong> objavljujemo
          podatke kao što su naziv, opis, lokacija, kontakt, radno vrijeme i
          druge informacije koje su javno dostupne ili koje ste nam vi
          dostavili.
        </p>
      </LegalSection>

      <LegalSection number="03" title="Kako koristimo vaše podatke">
        <p>
          Vaše podatke koristimo isključivo u svrhe koje su povezane sa
          funkcionisanjem i razvojem platforme:
        </p>
        <ul>
          <li>odgovaranje na vaše upite i zahtjeve</li>
          <li>uređenje i prikaz informacija o mjestima</li>
          <li>analizu korištenja platforme i optimizaciju sadržaja</li>
          <li>razvoj novih funkcija</li>
          <li>sigurnost sistema i zaštitu od zloupotreba</li>
        </ul>
        <p>
          Ne prodajemo vaše lične podatke trećim stranama. Podatke možemo
          dijeliti samo sa pouzdanim partnerima ili pružaocima usluga koji nam
          pomažu u radu platforme.
        </p>
      </LegalSection>

      <LegalSection number="04" title="Pravni osnov i kolačići">
        <p>Lične podatke obrađujemo na osnovu:</p>
        <ul>
          <li>vaše saglasnosti — npr. kontakt forma</li>
          <li>legitimnog interesa za rad platforme — npr. analitika, sigurnost</li>
          <li>ugovornog odnosa — kada zaključimo ugovor sa partnerom</li>
        </ul>
        <p>
          Detaljnije informacije o kolačićima možete pronaći u našoj{" "}
          <a href="/cookies">Politici kolačića</a>.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Vaša prava">
        <p>U skladu sa važećim propisima o zaštiti podataka, imate pravo da:</p>
        <ul>
          <li>zatražite uvid u podatke koje imamo o vama</li>
          <li>tražite ispravku netačnih ili nepotpunih podataka</li>
          <li>tražite brisanje podataka kada više nisu potrebni</li>
          <li>prigovorite određenim obradama podataka</li>
          <li>povučete saglasnost, ako se obrada zasniva na saglasnosti</li>
        </ul>
        <p>
          Svoja prava možete ostvariti putem stranice{" "}
          <a href="/contact">Kontakt</a>.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Sigurnost i izmjene">
        <p>
          Preduzimamo razumne tehničke i organizacione mjere da zaštitimo vaše
          podatke. Ovu Politiku privatnosti možemo povremeno ažurirati — najnovija
          verzija je uvijek dostupna na ovoj stranici.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
