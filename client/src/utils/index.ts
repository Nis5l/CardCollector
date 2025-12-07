import type { GameCard } from '../shared/types';
import Config from '../config.json';

const rememberme: string = "rememberme";

export function setRememberMe(value: boolean): void{
    localStorage.setItem(rememberme, value ? "true" : "false");
}

export function getRememberMe(): boolean{
    return localStorage.getItem(rememberme) === "true";
}

export function removeRememberMe(): void{
    localStorage.removeItem(rememberme);
}

export function random_string(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function parseCards(cards: GameCard[]): void {
    for (let i = 0; i < cards.length; i++) {
        cards[i].cardInfo.image = `${Config.API_HOST}/${cards[i].cardInfo.image}`;
        cards[i].cardFrame.front = `${Config.API_HOST}/${cards[i].cardFrame.front}`;
        cards[i].cardFrame.back = `${Config.API_HOST}/${cards[i].cardFrame.back}`;
        if (cards[i].cardEffect.image != null)
            cards[i].cardEffect.image = `${Config.API_HOST}/${cards[i].cardEffect.image}`;
    }
}

export function formatTime(t: number): string {
  let seconds: number | string = Math.floor((t / 1000) % 60);
  if (seconds < 10) seconds = "0" + seconds;
  let minutes: number | string = Math.floor((t / (60 * 1000)) % 60);
  if (minutes < 10) minutes = "0" + minutes;
  let hours: number | string = Math.floor((t / (60 * 60 * 1000)) % 24);
  if (hours < 10) hours = "0" + hours;
  let days: number | string = Math.floor(t / (60 * 60 * 24 * 1000));
  if (days < 10) days = "0" + days;
  let formatTime = days + ":" + hours + ":" + minutes + ":" + seconds;
  if (days === "00") {
    if (hours === "00") {
      if (minutes === "00") {
        formatTime = seconds.toString();
		return formatTime;
      }
      formatTime = minutes + ":" + seconds;
	  return formatTime;
    }
    formatTime = hours + ":" + minutes + ":" + seconds;
    return formatTime;
  }
  return formatTime;
}

export function timeSince(date: Date): string {
  let seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) {
      return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
      return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
      return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
      return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
      return Math.floor(interval) + " minutes";
  }
  if(seconds == 0)
      return "Just now";
  if(seconds < 0)
    return "How tf are you in the future?!";
  return Math.floor(seconds) + " seconds";
}

const MAILREGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export function checkMail(mail: string): boolean {
  return !MAILREGEX.test(mail);
}
