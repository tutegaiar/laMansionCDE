/**
 * Comunicados que se cargan solos la primera vez que arranca la base.
 * Se marcan como cargados en `paginas` (clave "seed:…"), así que si después
 * se borran desde /admin no vuelven a aparecer.
 */

export const SEED_COMUNICADOS = [
  {
    key: "seed:comunicado-ascenso-segunda",
    titulo: "Felicitaciones por el ascenso a Segunda",
    firma: "Comisión Directiva de La Mansión",
    imagen: "/comunicados/ascenso-segunda.webp",
    cuerpo: `Desde la Comisión Directiva de La Mansión, queremos expresar nuestras más sinceras felicitaciones a todo el plantel de jugadores y al cuerpo técnico por haber logrado el tan ansiado **ascenso a Segunda**. Este logro es el resultado del esfuerzo, la dedicación y el trabajo en equipo de cada uno de ustedes.

Hoy, todo el personal del club, desde los colaboradores hasta la dirigencia, se encuentra unido bajo un mismo y gran sueño: **jugar en la Primera División**.

Para acompañar este crecimiento y en reconocimiento al mérito deportivo:

- 🏆 **Premios y mejoras:** se asignarán los puntos correspondientes para que todos los integrantes del plantel tengan sus mejoras garantizadas.
- 🏟️ **Infraestructura:** paralelamente, se iniciarán obras de mejora y acondicionamiento en las instalaciones del estadio para estar a la altura de los nuevos desafíos que se vienen.

## ⚠️ Sobre el compromiso y la disciplina

El ascenso nos exige un nivel de profesionalismo y responsabilidad acorde a la categoría. Por lo tanto, no se tolerarán conductas que afecten al grupo ni el prestigio del club.

**1. Falta de compromiso en las convocatorias**

**1.a. Ausencias sin aviso.** Aquellos jugadores que se comprometan a asistir y luego no estén disponibles sin causa de fuerza mayor debidamente justificada, serán sancionados. En la jornada siguiente, deberán afrontar el compromiso jugando en la posición que el club determine, y no en su preferida. No se permitirá la excusa de "tengo sueño".

**1.b. Impuntualidad.** Quienes confirmen que van a estar conectados a un horario específico y lleguen tarde, también recibirán sanción: deberán disputar 2 partidos en la posición que elija la mayoría de los jugadores presentes en ese momento.

**2. Expulsiones irresponsables**

Quienes se hagan expulsar de manera injustificada o por indisciplina durante los partidos, deberán pagar la sanción jugando 2 partidos más obligatorios una vez cumplida la fecha de suspensión por la tarjeta, y tampoco podrán poner como excusa "tengo sueño" para desconectarse antes.

El camino a Primera se construye con talento, pero sobre todo con respeto, disciplina y un compromiso inquebrantable con el escudo.

**¡VAMOS LA MANSIÓN! 💚🖤**`,
  },
];

/** Texto inicial del reglamento interno (sale del comunicado del ascenso a Segunda). */
export const SEED_REGLAMENTO = `El ascenso nos exige un nivel de profesionalismo y responsabilidad acorde a la categoría. Por lo tanto, no se tolerarán conductas que afecten al grupo ni el prestigio del club.

## 1. Falta de compromiso en las convocatorias

**1.a. Ausencias sin aviso.** Aquellos jugadores que se comprometan a asistir y luego no estén disponibles sin causa de fuerza mayor debidamente justificada, serán sancionados. En la jornada siguiente, deberán afrontar el compromiso jugando en la posición que el club determine, y no en su preferida. No se permitirá la excusa de "tengo sueño".

**1.b. Impuntualidad.** Quienes confirmen que van a estar conectados a un horario específico y lleguen tarde, también recibirán sanción: deberán disputar 2 partidos en la posición que elija la mayoría de los jugadores presentes en ese momento.

## 2. Expulsiones irresponsables

Quienes se hagan expulsar de manera injustificada o por indisciplina durante los partidos, deberán pagar la sanción jugando 2 partidos más obligatorios una vez cumplida la fecha de suspensión por la tarjeta, y tampoco podrán poner como excusa "tengo sueño" para desconectarse antes.

El camino a Primera se construye con talento, pero sobre todo con respeto, disciplina y un compromiso inquebrantable con el escudo.

**Comisión Directiva de La Mansión**`;
