interface StudyNotebookPanelProps {
  techniqueNumber: number;
}

export function StudyNotebookPanel({ techniqueNumber: _techniqueNumber }: StudyNotebookPanelProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-3)",
          marginBottom: 16,
          paddingBottom: 10,
          borderBottom: "1px solid var(--line)",
        }}
      >
        Cuaderno de estudio
      </div>

      <NotebookSection
        label="Idea propia"
        placeholder="Agrega aquí tu idea central cuando estudies esta técnica."
      />
      <NotebookSection
        label="Qué observar"
        placeholder="¿Qué elementos posicionales son clave? Escríbelo con tus palabras."
      />
      <NotebookSection
        label="Pregunta guiada"
        placeholder="Pregunta de entrenamiento pendiente de edición propia."
      />
      <NotebookSection
        label="Explicación propia"
        placeholder="Escribe tu explicación de los ejemplos una vez los hayas estudiado."
      />

      <div
        style={{
          marginTop: 20,
          padding: "12px 14px",
          borderRadius: 10,
          background: "rgba(200,169,107,0.04)",
          border: "1px solid rgba(200,169,107,0.12)",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--amber)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Cómo estudiar
        </div>
        {[
          "Lee la idea con tus propias palabras.",
          "Reproduce los ejemplos del tablero.",
          "Responde las preguntas guiadas.",
          "Repite las posiciones que no dominas.",
        ].map((step, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 6,
              fontSize: 12,
              color: "var(--text-3)",
              lineHeight: 1.5,
            }}
          >
            <span
              style={{
                color: "var(--amber)",
                flexShrink: 0,
                fontVariantNumeric: "tabular-nums",
                opacity: 0.7,
              }}
            >
              {i + 1}.
            </span>
            {step}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 18 }}>
        <DisabledAction label="Practicar posiciones" />
        <DisabledAction label="Marcar como revisada" />
      </div>

      <p
        style={{
          fontSize: 11,
          color: "var(--text-3)",
          marginTop: 14,
          fontStyle: "italic",
          lineHeight: 1.5,
          opacity: 0.7,
        }}
      >
        Las notas propias y preguntas guiadas se añadirán progresivamente.
      </p>
    </div>
  );
}

function NotebookSection({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div
      style={{
        paddingBottom: 14,
        marginBottom: 14,
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "var(--text-3)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--text-3)",
          lineHeight: 1.6,
          fontStyle: "italic",
          opacity: 0.65,
        }}
      >
        {placeholder}
      </div>
    </div>
  );
}

function DisabledAction({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: 8,
        border: "1px solid var(--line)",
        fontSize: 12,
        color: "var(--text-3)",
        textAlign: "center",
        opacity: 0.45,
        cursor: "not-allowed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
    >
      <span>{label}</span>
      <span style={{ fontSize: 10, letterSpacing: "0.04em" }}>— próxima sesión</span>
    </div>
  );
}
