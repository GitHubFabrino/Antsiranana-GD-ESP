// jsPDF plugins
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Vuejs plugins
import { ref } from "vue";

// pinia plugins
import { defineStore } from "pinia";

// my plugins
import { URL } from "@/plugins/url";
import { Service } from "@/plugins/service";

// my pinia store
import { useUEStore } from "./ue";
import { useOverlayStore } from "./overlay";

// export this store
export const usePdfStore = defineStore("pdf", () => {
  const url = new URL();
  const service = new Service();

  const ue = useUEStore();
  const overlay = useOverlayStore();

  const listCandidateAdmis = ref([]);

  function getResutlsCTCI(list, sessionCTCI) {
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      putOnlyUsedFonts: true,
      compress: true,
    });

    listCandidateAdmis.value = [];
    listCandidateAdmis.value = list;
    pdf.setFontSize(8);
    pdf.setFont("arial");
    pdf.addImage(`${url.images}/logo-una.png`, 10, 5, 30, 30);
    pdf.addImage(`${url.images}/logo-espa-1.png`, 170, 5, 30, 30);
    pdf.text(`UNIVERSITÉ D'ANTSIRANANA`, 105, 20, { align: "center" });
    pdf.text(`ÉCOLE SUPÉRIEURE POLYTECHNIQUE`, 105, 25, {
      align: "center",
    });
    pdf.setFontSize(8);
    pdf.setFont("arial", "bold");
    pdf.text(
      `LISTE DES CANDIDATS ADMIS AU CONCOURS D'ENTREE EN PREMIERE ANNEE`,
      105,
      40,
      { align: "center" }
    );
    pdf.text(
      `CONCOURS DU ${sessionCTCI}`,
      105,
      45,
      { align: "center" }
    );
    pdf.setFontSize(11);
    pdf.setFont("arial", "normal");
    const result = ref([["Rang", "N°", "Nom", "Prénoms"]]);
    listCandidateAdmis.value.map((item, index) => {
      result.value.push([
        `${Number(index + 1)}`,
        `${item.numeroCandidatCTCI}`,
        `${item.nom}`,
        `${item.prenoms}`
      ]);
    });

    autoTable(pdf, {
      theme: "grid",
      startY: 50,
      bodyStyles: { font: "times" },
      body: result.value,
      styles :{
        fontSize : 8
      },
      rowPageHeight : 5,
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 70, halign: "left", cellPadding: [2, 0, 0, 5] },
        3: { cellWidth: 70, halign: "left", cellPadding: [2, 0, 0, 5] },
      },
    });
    pdf.setFontSize(9);
    const lastY = pdf.lastAutoTable.finalY + 15
    pdf.setFont("times");
    pdf.text(
      `Arrêtée la présente liste au nombre de (${
        list.length
      }) candidats admis`,
      15,lastY
    );
    pdf.save(
      `Liste des admis en PREMIÈRE ANNÉE - Concours du ${sessionCTCI}.pdf`
    );
  }






  function getResutlsCTCIAttente(list, sessionCTCI) {
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      putOnlyUsedFonts: true,
      compress: true,
    });

    listCandidateAdmis.value = [];
    listCandidateAdmis.value = list;
    pdf.setFontSize(8);
    pdf.setFont("arial");
    pdf.addImage(`${url.images}/logo-una.png`, 10, 5, 30, 30);
    pdf.addImage(`${url.images}/logo-espa-1.png`, 170, 5, 30, 30);
    pdf.text(`UNIVERSITÉ D'ANTSIRANANA`, 105, 20, { align: "center" });
    pdf.text(`ÉCOLE SUPÉRIEURE POLYTECHNIQUE`, 105, 25, {
      align: "center",
    });
    pdf.setFontSize(8);
    pdf.setFont("arial", "bold");
    pdf.text(
      `LISTE D'ATTENTE AU CONCOURS D'ENTREE EN PREMIERE ANNEE`,
      105,
      40,
      { align: "center" }
    );
    pdf.text(
      `CONCOURS DU ${sessionCTCI}`,
      105,
      45,
      { align: "center" }
    );
    pdf.setFontSize(11);
    pdf.setFont("arial", "normal");
    const result = ref([["N°", "Nom", "Prénoms"]]);
    listCandidateAdmis.value.map((item, index) => {
      result.value.push([
        `${item.numeroCandidatCTCI}`,
        `${item.nom}`,
        `${item.prenoms}`
      ]);
    });

    autoTable(pdf, {
      theme: "grid",
      startY: 50,
      bodyStyles: { font: "times" },
      body: result.value,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: 'middle',
      },
      margin: { horizontal: 30 },
      rowPageHeight : 5,
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        1: { cellWidth: 70, halign: "left", cellPadding: [2, 0, 0, 5] },
        2: { cellWidth: 70, halign: "left", cellPadding: [2, 0, 0, 5] },
      },
    });
    pdf.setFontSize(9);
    const lastY = pdf.lastAutoTable.finalY + 15
    pdf.setFont("times");
    pdf.text(
      `Arrêtée la présente liste au nombre de (${
        list.length
      }) candidats admis`,
    30,lastY
    );
    pdf.save(
      `Liste des admis en PREMIÈRE ANNÉE (LISTE d'attente) - Concours du ${sessionCTCI}.pdf`
    );
  }









  function getlisteCandidat(list, nomCentreCTCI, codePostale, sessionCTCI) {
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      putOnlyUsedFonts: true,
      compress: true,
    });

    listCandidateAdmis.value = [];
    listCandidateAdmis.value = list;
    pdf.setFontSize(8);
    pdf.setFont("arial");
    pdf.addImage(`${url.images}/logo-una.png`, 10, 5, 30, 30);
    pdf.addImage(`${url.images}/logo-espa-1.png`, 170, 5, 30, 30);
    pdf.text(`UNIVERSITÉ D'ANTSIRANANA`, 105, 20, { align: "center" });
    pdf.text(`ÉCOLE SUPÉRIEURE POLYTECHNIQUE`, 105, 25, {
      align: "center",
    });
    pdf.setFontSize(8);
    pdf.setFont("arial", "bold");
    pdf.text(
      `LISTE DES CANIDATS`,
      105,
      35,
      { align: "center" }
    );
    pdf.text(`CONCOURS DU ${sessionCTCI}`, 105, 40, { align: "center" });
    pdf.setFontSize(8);
    pdf.text(
      `Centre  ${String(nomCentreCTCI).toUpperCase()}  ${codePostale}`,
      105,
      45,
      { align: "center" }
    );
    pdf.setFontSize(11);
    pdf.setFont("times", "normal");
    const result = ref([["N°", "Nom et prénoms"]]);
    listCandidateAdmis.value.map((item, index) => {
      result.value.push([
        `${item.numeroCandidatCTCI}`,
        `${item.nom} ${item.prenoms}`,
      ]);
    });
    autoTable(pdf, {
      theme: "grid",
      startY: 50,
      bodyStyles: { font: "times" },
      body: result.value,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: 'middle',
      },
      margin: { horizontal: 30 },
      columnStyles: {
        0: { cellWidth: 25, halign: "center" },
        1: { cellWidth: 120, halign: "left", cellPadding: [2, 0, 0, 5] },
      },
    });
    pdf.setFontSize(9);
    pdf.setFont("times");
    const lastY = pdf.lastAutoTable.finalY + 15
    pdf.text(
      `Arrêtée la présente liste au nombre de (${
        list.length
      }) candidats`,
      30,
      lastY
    );
    pdf.save(
      `Liste des candidats pour le concours d'entrer en PREMIÈRE ANNÉE - session du ${sessionCTCI} - ${nomCentreCTCI} ${codePostale}.pdf`
    );
  }

  function getReleveNote(data) {
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      putOnlyUsedFonts: true,
      compress: true,
    });
    pdf.setFontSize(8);
    pdf.setFont("times", "normal");
    pdf.addImage(`${url.images}/logo-una.png`, 20, 15, 30, 30);
    pdf.addImage(`${url.images}/logo-espa-1.png`, 160, 15, 30, 30);
    pdf.text(`UNIVERSITÉ D'ANTSIRANANA`, 105, 17, { align: "center" });
    pdf.text(`**********`, 105, 22, { align: "center" });
    pdf.text(`École Supérieure Polytechnique d'Antsiranana`, 105, 27, {
      align: "center",
    });
    pdf.text(`**********`, 105, 32, { align: "center" });
    pdf.text(`Mention : ${data.mention}`, 105, 37, { align: "center" });
    pdf.text(`**********`, 105, 42, { align: "center" });
    pdf.text(`Parcours : ${data.parcours}`, 105, 47, { align: "center" });
    pdf.text(`**********`, 105, 52, { align: "center" });
    pdf.text(`Niveau : ${data.niveau}`, 105, 57, { align: "center" });
    pdf.text(`**********`, 105, 62, { align: "center" });
    pdf.text(`Année universitaire : ${data.au}`, 105, 67, { align: "center" });
    pdf.setFontSize(10);
    pdf.setFont("times", "bold");
    pdf.text(`RELEVÉ DE NOTES`, 105, 72, { align: "center" });
    pdf.setFontSize(10);
    pdf.setFont("times", "normal");
    pdf.text(`De : `, 14, 80);
    pdf.setFont("times", "bold");
    pdf.text(`${data.nom} ${data.prenoms}`, 24, 80);
    pdf.setFont("times", "normal");
    pdf.text(`Semestre : ${data.semestre1Nom}`, 14, 87);
    pdf.setFontSize(10);
    const semestre1 = ref([
      [
        { content: "Unité d'enseignement", styles: { cellWidth: 30 } },
        { content: "Élément constitutif", styles: { cellWidth: 50 } },
        { content: "Note d'EC", styles: { cellWidth: 15 } },
        { content: "Moyenne d'UE", styles: { cellWidth: 20 } },
        { content: "Crédit d'UE", styles: { cellWidth: 20 } },
        { content: "Observation", styles: { cellWidth: 25 } },
      ],
    ]);
    data.semestre1.map((item) => {
      const lengthEC = ref(item.nomEC.length);
      const stylesCell = ref({
        halign: "left",
        valign: "middle",
        overflow: "linebreak",
      });
      for (let i = 0; i < lengthEC.value; i++) {
        if (i == 0) {
          semestre1.value.push([
            {
              content: `${item.nomUE}`,
              rowSpan: lengthEC.value,
              styles: { ...stylesCell.value },
            },
            { content: item.nomEC[i], styles: stylesCell.value },
            { content: item.noteEC[i] },
            {
              content: item.moyenneUE,
              rowSpan: lengthEC.value,
              styles: { valign: "middle" },
            },
            {
              content: item.creditUE,
              rowSpan: lengthEC.value,
              styles: { valign: "middle" },
            },
            {
              content: ue.getObservation(item.validationUE),
              rowSpan: lengthEC.value,
              styles: { valign: "middle" },
            },
          ]);
        } else {
          semestre1.value.push([
            { content: `${item.nomEC[i]}`, styles: stylesCell.value },
            { content: `${item.noteEC[i]}` },
          ]);
        }
      }
    });
    autoTable(pdf, {
      theme: "grid",
      startY: 90,
      bodyStyles: {
        font: "times",
        fontSize: 8,
        halign: "center",
        valign: "middle",
        overflow: "linebreak",
      },
      body: semestre1.value,
      styles: {
        fontSize: 10,
        cellPadding: 2,
        valign: 'middle',
      },
      margin: { horizontal: 25 },
    });
    const a = ref(92);
    const lengthEC = `${data.semestre1.length}`;
    const b = a.value + lengthEC * 19;

    pdf.text(`Semestre : ${data.semestre2Nom}`, 14, b);
    const semestre2 = ref([
      [
        { content: "Unité d'enseignement", styles: { cellWidth: 30 } },
        { content: "Élément constitutif", styles: { cellWidth: 50 } },
        { content: "Note d'EC", styles: { cellWidth: 15 } },
        { content: "Moyenne d'UE", styles: { cellWidth: 20 } },
        { content: "Crédit d'UE", styles: { cellWidth: 20 } },
        { content: "Observation", styles: { cellWidth: 25 } },
      ],
    ]);
    data.semestre2.map((item) => {
      const lengthEC = ref(item.nomEC.length);
      const stylesCell = ref({
        halign: "left",
        valign: "middle",
        overflow: "linebreak",
      });
      for (let i = 0; i < lengthEC.value; i++) {
        if (i == 0) {
          semestre2.value.push([
            {
              content: `${item.nomUE}`,
              rowSpan: lengthEC.value,
              styles: { ...stylesCell.value, outerWidth: 150 },
            },
            { content: item.nomEC[i], styles: stylesCell.value },
            { content: item.noteEC[i] },
            {
              content: item.moyenneUE,
              rowSpan: lengthEC.value,
              styles: { valign: "middle" },
            },
            {
              content: item.creditUE,
              rowSpan: lengthEC.value,
              styles: { valign: "middle" },
            },
            {
              content: ue.getObservation(item.validationUE),
              rowSpan: lengthEC.value,
              styles: { valign: "middle" },
            },
          ]);
        } else {
          semestre2.value.push([
            { content: `${item.nomEC[i]}`, styles: stylesCell.value },
            { content: `${item.noteEC[i]}` },
          ]);
        }
      }
    });

    const c = b;
    const lengthECA = `${data.semestre2.length}`;
    const d = c + lengthECA * 20;
    autoTable(pdf, {
      theme: "grid",
      startY: b + 3,
      bodyStyles: {
        font: "times",
        halign: "center",
        fontSize: 8,
        valign: "middle",
        overflow: "linebreak",
      },
      body: semestre2.value,
      styles: {
        fontSize: 10,
        cellPadding: 2,
        valign: 'middle',
      },
      margin: { horizontal: 25 },
    });
    if (data.moyenne < 10) data.mentionResutlat = "Néant";
    if (data.moyenne >= 10 && data.moyenne < 12)
      data.mentionResutlat = "Passable";
    if (data.moyenne >= 12 && data.moyenne < 14)
      data.mentionResutlat = "Assez-Bien";
    if (data.moyenne >= 14 && data.moyenne < 16) data.mentionResutlat = "Bien";
    if (data.moyenne >= 16 && data.moyenne < 18)
      data.mentionResutlat = "Trés-Bien";
    if (data.moyenne >= 18 && data.moyenne < 20)
      data.mentionResutlat = "Honorable";
    pdf.text(`Moyenne générale : ${data.moyenne}/20`, 105, d + 5, {
      align: "center",
    });
    pdf.text(`Mention : ${data.mentionResutlat}`, 105, d + 10, {
      align: "center",
    });
    pdf.text(`Observation : ${data.codeRedoublement}`, 105, d + 15, {
      align: "center",
    });
    pdf.text(
      "En application des instructions, il est interdit de délivrer un deuxième relevé de notes. L'intéressé ne devrait en aucun cas se dessaisir du présent relevé.",
      14,
      d + 25,
      { maxWidth: 75 }
    );
    pdf.text(
      `Antsiranana, le ${new Date().getDate()} ${service.getMonth(
        new Date().getMonth()
      )} ${new Date().getFullYear()}.`,
      190,
      d + 25,
      { maxWidth: 100, align: "right" }
    );
    pdf.text(`LE DIRECTEUR de l'E.S.P.`, 190, d + 30, {
      maxWidth: 100,
      align: "right",
    });
    pdf.text(`${data.directeur}`, 190, 270, { maxWidth: 100, align: "right" });
    pdf.save(`Relevé de notes de ${data.nom} ${data.prenoms}.pdf`);
  }

  function getResultsFinAU(data) {
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      putOnlyUsedFonts: true,
      compress: true,
    });
    pdf.setFontSize(8);
    pdf.setFont("times", "normal");
    pdf.addImage(`${url.images}/logo-una.png`, 20, 15, 30, 30);
    pdf.addImage(`${url.images}/logo-espa-1.png`, 160, 15, 30, 30);
    pdf.text(`UNIVERSITÉ D'ANTSIRANANA`, 105, 20, { align: "center" });
    pdf.text(`**********`, 105, 26, { align: "center" });
    pdf.text(`École Supérieure Polytechnique d'Antsiranana`, 105, 30, {
      align: "center",
    });
    pdf.text(`**********`, 105, 36, { align: "center" });
    pdf.text(`Mention : ${data.mention}`, 105, 40, { align: "center" });
    pdf.text(`**********`, 105, 46, { align: "center" });
    pdf.text(`Parcours : ${data.parcours}`, 105, 50, { align: "center" });
    pdf.text(`**********`, 105, 56, { align: "center" });
    pdf.text(`Niveau : ${data.niveau}`, 105, 60, { align: "center" });
    pdf.text(`**********`, 105, 66, { align: "center" });
    pdf.text(`Année universitaire : ${data.au}`, 105, 70, { align: "center" });
    pdf.setFontSize(10);
    pdf.setFont("times", "bold");
    pdf.text(`RÉSULTAT - ${data.result}`, 105, 80, { align: "center" });
    const result = ref([
      [{ content: "Rang", styles: { cellWidth: 20 } }, "Nom et prénoms"],
    ]);
    data.list.map((item, index) => {
      result.value.push([
        `${Number(index + 1)}`,
        `${item.nom} ${item.prenoms}`,
      ]);
    });
    autoTable(pdf, {
      theme: "grid",
      startY: 90,
      bodyStyles: { font: "times" },
      body: result.value,
      styles: {
        fontSize: 10,
        cellPadding: 2,
        valign: 'middle',
      },
      margin: { horizontal: 30 },
      columnStyles: {
        0: { cellWidth: 25, halign: "center" },
        1: { cellWidth: 120, halign: "left", cellPadding: [2, 0, 0, 5] },
      },
      
    });
    pdf.setFontSize(9);
    pdf.setFont("arial", "normal");
    const lastY = pdf.lastAutoTable.finalY + 15
    pdf.text(
      `Arrêtée la présente liste au nombre de (${
        data.list.length
      }) candidats ${data.result} `,
      30,
      lastY
    );
    pdf.save(`Résultat _ ${data.au} _ ${data.parcours} _ ${data.result}.pdf`);
    overlay.hide();
  }

  function getAttestation(data) {
    console.table(data);
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      putOnlyUsedFonts: true,
      compress: true,
    });
    pdf.setFontSize(11);
    pdf.setFont("times", "normal");
    pdf.addImage(`${url.images}/logo-espa-1.png`, 20, 10, 30, 30);
    pdf.text(`UNIVERSITÉ D'ANTSIRANANA`, 130, 20, {
      maxWidth: 130,
      align: "center",
    });
    pdf.text(`ÉCOLE SUPÉRIEURE POLYTECHNIQUE D'ANTSIRANANA`, 130, 27.5, {
      maxWidth: 130,
      align: "center",
    });
    pdf.text(`BP : 201 ANTSIRANANA MADAGASCAR`, 130, 35, {
      maxWidth: 130,
      align: "center",
    });
    pdf.line(20, 40, 190, 40);
    pdf.text(`«Maitriser aujourd'hui la technologie de demain.»`, 150, 45, {
      maxWidth: 130,
      align: "center",
    });
    pdf.text(
      `Antsiranana, le ${new Date().getDate()} ${service.getMonth(
        new Date().getMonth()
      )} ${new Date().getFullYear()}.`,
      20,
      55,
      { align: "left" }
    );
    pdf.setFontSize(16);
    pdf.setFont("times", "bold");
    pdf.text(`ATTESTATION DE REUSSITE`, 105, 70, { align: "center" });
    pdf.setFontSize(11);
    pdf.setFont("times", "normal");
    pdf.text(
      `Je ${data.sexeRM == "Masculin" ? "soussigné" : "soussignée"} ${
        data.nomRM
      } ${data.prenomsRM}, responsable de la mention « ${
        data.mention
      } » de l'École Supérieure Polytechnique d'Antsiranana, atteste par la présente que l'étudiant : `,
      20,
      85,
      { maxWidth: 170, align: "justify", lineHeightFactor: 1.5 }
    );
    pdf.text(`Nom et prénoms : `, 20, 105);
    pdf.setFont("times", "bold");
    pdf.text(`${data.nom} ${data.prenoms}`, 60, 105);
    pdf.setFont("times", "normal");
    pdf.text(`Date de naissance : `, 20, 115);
    pdf.setFont("times", "bold");
    pdf.text(`${data.dateNaissance}`, 60, 115);
    pdf.setFont("times", "normal");
    pdf.text(`Lieu de naissance : `, 20, 125);
    pdf.setFont("times", "bold");
    pdf.text(`${data.lieuNaissance}`, 60, 125);
    pdf.setFont("times", "normal");
    pdf.text(`Numéro du CIN : `, 20, 135);
    pdf.setFont("times", "bold");
    pdf.text(`${data.numeroCIN}`, 60, 135);
    pdf.setFont("times", "normal");
    pdf.text(`Niveau : `, 20, 145);
    pdf.setFont("times", "bold");
    pdf.text(`${data.niveau}`, 60, 145);
    pdf.setFont("times", "normal");
    pdf.text(`Numéro d'inscription : `, 20, 155);
    pdf.setFont("times", "bold");
    pdf.text(`${data.numeroInscription}`, 60, 155);
    pdf.setFont("times", "normal");
    pdf.text(`Année universitaire : `, 20, 165);
    pdf.setFont("times", "bold");
    pdf.text(`${data.anneeUniversitaire}`, 60, 165);
    pdf.setFont("times", "normal");
    pdf.text(`Parcours : `, 20, 175);
    pdf.setFont("times", "bold");
    pdf.text(`${data.parcours}`, 60, 175);
    pdf.setFont("times", "normal");
    pdf.text(`Année : `, 20, 185);
    pdf.setFont("times", "bold");
    pdf.text(`${data.anneeFin}`, 60, 185);
    pdf.setFont("times", "normal");
    pdf.text(
      `a effectué avec succès ses études. Cette attestation n'est pas et ne remplace en aucun cas un diplôme. Cette attestation lui est délivrée pour servir et faire valoir ce que de droit.`,
      20,
      200,
      { maxWidth: 170, align: "justify", lineHeightFactor: 1.5 }
    );
    pdf.text(`Le responsable de la mention`, 150, 220, {
      maxWidth: 130,
      align: "center",
    });
    pdf.text(`Le responsable de la mention`, 150, 220, {
      maxWidth: 130,
      align: "center",
    });
    pdf.save(`Attestation de réussite : ${data.nom} ${data.prenoms}.pdf`);
  }

  return {
    getResutlsCTCI,
    getReleveNote,
    getResultsFinAU,
    getAttestation,
    getlisteCandidat,
    getResutlsCTCIAttente,
  };
});
