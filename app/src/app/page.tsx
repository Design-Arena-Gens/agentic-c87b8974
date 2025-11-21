"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";
import type { GeneratedScenario } from "@/lib/scenario";

const placeholders = [
  "Crée un scénario Make qui qualifie les prospects LinkedIn, génère un résumé personnalisé et le publie dans Slack.",
  "Construis un scénario pour analyser les tickets Zendesk, synthétiser la réponse idéale et mettre à jour Notion.",
  "Imagine un scénario qui produit un reporting marketing hebdomadaire dans Google Slides avec un résumé IA.",
];

const examples = [
  "Analyse des retours clients dans un Google Sheet et rédaction automatique de réponses personnalisées via Slack.",
  "Veille médias sociaux : surveiller Twitter, résumer les tendances et envoyer un rapport quotidien par email.",
  "Support client : trier les tickets, proposer une réponse IA et mettre à jour HubSpot.",
];

export default function HomePage() {
  const [prompt, setPrompt] = useState(placeholders[0]);
  const [scenario, setScenario] = useState<GeneratedScenario | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedArtifact, setCopiedArtifact] = useState<string | null>(null);

  const promptPlaceholder = useMemo(() => {
    const index = Math.floor(Math.random() * placeholders.length);
    return placeholders[index];
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Impossible de générer le scénario.");
      }

      const data = (await response.json()) as { scenario: GeneratedScenario };
      setScenario(data.scenario);
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue.",
      );
    }
  }

  async function copyToClipboard(contents: string, filename: string) {
    try {
      await navigator.clipboard.writeText(contents);
      setCopiedArtifact(filename);
      setTimeout(() => setCopiedArtifact(null), 2000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible de copier dans le presse-papiers.",
      );
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>
              Agent IA pour scénarios Make
              <span>Générez des automatismes enrichis en agents IA.</span>
            </h1>
            <p>
              Décrivez votre besoin en langage naturel. L’agent comprend votre
              intention, place les connecteurs Make appropriés et sélectionne
              les agents IA pertinents pour vos flux.
            </p>
            <ul className={styles.exampleList}>
              {examples.map((example) => (
                <li key={example}>
                  <button
                    type="button"
                    className={styles.exampleButton}
                    onClick={() => setPrompt(example)}
                  >
                    {example}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <form className={styles.promptForm} onSubmit={handleSubmit}>
            <label className={styles.label} htmlFor="prompt">
              Votre prompt
            </label>
            <textarea
              id="prompt"
              className={styles.textarea}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={promptPlaceholder}
              rows={7}
              required
            />
            <button
              type="submit"
              className={styles.submit}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Génération en cours…" : "Générer le scénario"}
            </button>
            {status === "error" ? (
              <p className={styles.error}>{errorMessage}</p>
            ) : null}
          </form>
        </section>

        {scenario ? (
          <section className={styles.results}>
            <header className={styles.resultHeader}>
              <div>
                <h2>{scenario.name}</h2>
                <p>{scenario.summary}</p>
              </div>
              <span className={styles.badge}>{scenario.estimatedRunTime}</span>
            </header>

            <div className={styles.grid}>
              <article className={styles.card}>
                <h3>Objectif</h3>
                <p>{scenario.objective}</p>
                <ul className={styles.promptBreakdown}>
                  {scenario.promptBreakdown.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </article>

              <article className={styles.card}>
                <h3>Étapes Make</h3>
                <ol className={styles.moduleList}>
                  {scenario.modules.map((module) => (
                    <li key={module.id}>
                      <div className={styles.moduleHeader}>
                        <span className={styles.chip}>{module.type}</span>
                        <span className={styles.moduleLabel}>{module.label}</span>
                      </div>
                      <p className={styles.modulePurpose}>{module.purpose}</p>
                      <code className={styles.moduleApp}>{module.app}</code>
                    </li>
                  ))}
                </ol>
              </article>

              <article className={styles.card}>
                <h3>Connexions</h3>
                <ul className={styles.connectionList}>
                  {scenario.connections.map((connection, index) => (
                    <li key={`${connection.from}-${connection.to}-${index}`}>
                      <strong>{connection.from}</strong>
                      <span aria-hidden>→</span>
                      <strong>{connection.to}</strong>
                      {connection.condition ? (
                        <em>{connection.condition}</em>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </article>

              <article className={styles.card}>
                <h3>Artefacts</h3>
                <ul className={styles.artifactList}>
                  {scenario.artifacts.map((artifact) => (
                    <li key={artifact.filename}>
                      <div className={styles.artifactMeta}>
                        <span className={styles.artifactName}>
                          {artifact.filename}
                        </span>
                        <span className={styles.artifactFormat}>
                          {artifact.format.toUpperCase()}
                        </span>
                      </div>
                      <button
                        type="button"
                        className={styles.copyButton}
                        onClick={() =>
                          copyToClipboard(artifact.contents, artifact.filename)
                        }
                      >
                        {copiedArtifact === artifact.filename
                          ? "Copié !"
                          : "Copier"}
                      </button>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </section>
        ) : null}
      </main>
      <footer className={styles.footer}>
        <p>
          Propulsé par un moteur de génération dédié Make + Agents IA. Adapté
          aux équipes francophones.
        </p>
      </footer>
    </div>
  );
}
