import { LocaleConfig } from 'react-native-calendars';

const locales: Record<string, typeof LocaleConfig.locales[string]> = {
  it: {
    monthNames: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
    monthNamesShort: ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'],
    dayNames: ['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'],
    dayNamesShort: ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'],
    today: 'Oggi',
  },
  en: {
    monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    monthNamesShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    today: 'Today',
  },
  es: {
    monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
    monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
    dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
    dayNamesShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
    today: 'Hoy',
  },
  fr: {
    monthNames: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
    monthNamesShort: ['Janv','Févr','Mars','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc'],
    dayNames: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
    dayNamesShort: ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
    today: "Aujourd'hui",
  },
  de: {
    monthNames: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
    monthNamesShort: ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'],
    dayNames: ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
    dayNamesShort: ['So','Mo','Di','Mi','Do','Fr','Sa'],
    today: 'Heute',
  },
};

export function applyCalendarLocale(lang: string): void {
  const key = Object.prototype.hasOwnProperty.call(locales, lang) ? lang : 'it';
  if (!LocaleConfig.locales[key]) {
    LocaleConfig.locales[key] = locales[key];
  }
  LocaleConfig.defaultLocale = key;
}
