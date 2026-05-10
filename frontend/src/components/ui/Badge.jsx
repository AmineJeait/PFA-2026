const STATUS_MAP = {
  // green
  ACTIF:       "#22c77a",
  APPROUVE:    "#22c77a",
  PAYE:        "#22c77a",
  PRESENT:     "#22c77a",
  ACCEPTE:     "#22c77a",
  OUVERT:      "#22c77a",
  // orange
  EN_ATTENTE:  "#f5a623",
  BROUILLON:   "#f5a623",
  RETARD:      "#f5a623",
  EN_COURS:    "#f5a623",
  // red
  SUSPENDU:    "#f05252",
  REJETE:      "#f05252",
  ABSENT:      "#f05252",
  REFUSE:      "#f05252",
  ANNULE:      "#f05252",
  // muted
  INACTIF:     "#8886a0",
  FERME:       "#8886a0",
  // blue
  DEMI_JOURNEE:"#38bdf8",
  RECU:        "#38bdf8",
  VALIDE:      "#38bdf8",
  EN_CONGE:    "#38bdf8",
  ENTRETIEN:   "#8b83ff",
};

/**
 * Props:
 *   status  {string}  — e.g. "ACTIF", "EN_ATTENTE"
 *   label   {string}  — optional override text
 */
export default function Badge({ status, label }) {
  const color = STATUS_MAP[status] || "#8886a0";
  const text  = (label ?? status ?? "").replace(/_/g, " ");

  return (
    <span
      style={{
        display:         "inline-block",
        fontSize:        11,
        fontWeight:      500,
        padding:         "3px 10px",
        borderRadius:    20,
        background:      color + "20",   // 12% opacity hex
        color:           color,
        whiteSpace:      "nowrap",
        letterSpacing:   "0.2px",
        fontFamily:      "'DM Sans', sans-serif",
      }}
    >
      {text}
    </span>
  );
}
