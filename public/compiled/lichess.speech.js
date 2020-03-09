(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LichessSpeech = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const roles = { P: 'pawn', R: 'rook', N: 'knight', B: 'bishop', Q: 'queen', K: 'king' };
function renderSan(san) {
    let move;
    if (san.includes('O-O-O'))
        move = 'long castle';
    else if (san.includes('O-O'))
        move = 'short castle';
    else
        move = san.split('').map(c => {
            if (c == 'x')
                return 'takes';
            if (c == '+')
                return 'check';
            if (c == '#')
                return 'checkmate';
            if (c == '=')
                return 'promotes to';
            if (c == '@')
                return 'at';
            const code = c.charCodeAt(0);
            if (code > 48 && code < 58)
                return c; // 1-8
            if (code > 96 && code < 105)
                return c.toUpperCase();
            return roles[c] || c;
        }).join(' ');
    return move;
}
function hackFix(msg) {
    return msg
        .replace(/^A /, "A, ") // "A takes" & "A 3" are mispronounced
        .replace(/(\d) E (\d)/, "$1,E $2") // Strings such as 1E5 are treated as scientific notation
        .replace(/C /, "c ") // "uppercase C is pronounced as "degrees celsius" when it comes after a number (e.g. R8c3)
        .replace(/F /, "f "); // "uppercase F is pronounced as "degrees fahrenheit" when it comes after a number (e.g. R8f3)
}
function say(text, cut) {
    const msg = new SpeechSynthesisUtterance(hackFix(text));
    if (cut)
        speechSynthesis.cancel();
    window.lichess.sound.say(msg);
}
exports.say = say;
function step(s, cut) {
    say(s.san ? renderSan(s.san) : 'Game start', cut);
}
exports.step = step;

},{}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsTUFBTSxLQUFLLEdBQWlDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUV0SCxTQUFTLFNBQVMsQ0FBQyxHQUFRO0lBQ3pCLElBQUksSUFBWSxDQUFDO0lBQ2pCLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7UUFBRSxJQUFJLEdBQUcsYUFBYSxDQUFDO1NBQzNDLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFBRSxJQUFJLEdBQUcsY0FBYyxDQUFDOztRQUMvQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDaEMsSUFBSSxDQUFDLElBQUksR0FBRztnQkFBRSxPQUFPLE9BQU8sQ0FBQztZQUM3QixJQUFJLENBQUMsSUFBSSxHQUFHO2dCQUFFLE9BQU8sT0FBTyxDQUFDO1lBQzdCLElBQUksQ0FBQyxJQUFJLEdBQUc7Z0JBQUUsT0FBTyxXQUFXLENBQUM7WUFDakMsSUFBSSxDQUFDLElBQUksR0FBRztnQkFBRSxPQUFPLGFBQWEsQ0FBQztZQUNuQyxJQUFJLENBQUMsSUFBSSxHQUFHO2dCQUFFLE9BQU8sSUFBSSxDQUFDO1lBQzFCLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0IsSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksR0FBRyxFQUFFO2dCQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTTtZQUM1QyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksSUFBSSxHQUFHLEdBQUc7Z0JBQUUsT0FBTyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDcEQsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNiLE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFDLEdBQVc7SUFFMUIsT0FBTyxHQUFHO1NBQ1AsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxzQ0FBc0M7U0FDNUQsT0FBTyxDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQyx5REFBeUQ7U0FDM0YsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQywyRkFBMkY7U0FDL0csT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLDhGQUE4RjtBQUN4SCxDQUFDO0FBRUQsU0FBZ0IsR0FBRyxDQUFDLElBQVksRUFBRSxHQUFZO0lBQzVDLE1BQU0sR0FBRyxHQUFHLElBQUksd0JBQXdCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDeEQsSUFBSSxHQUFHO1FBQUUsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2xDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBSkQsa0JBSUM7QUFFRCxTQUFnQixJQUFJLENBQUMsQ0FBZ0IsRUFBRSxHQUFZO0lBQ2pELEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDcEQsQ0FBQztBQUZELG9CQUVDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3Qgcm9sZXM6IHsgW2xldHRlcjogc3RyaW5nXTogc3RyaW5nIH0gPSB7IFA6ICdwYXduJywgUjogJ3Jvb2snLCBOOiAna25pZ2h0JywgQjogJ2Jpc2hvcCcsIFE6ICdxdWVlbicsIEs6ICdraW5nJyB9O1xuXG5mdW5jdGlvbiByZW5kZXJTYW4oc2FuOiBTYW4pIHtcbiAgbGV0IG1vdmU6IHN0cmluZztcbiAgaWYgKHNhbi5pbmNsdWRlcygnTy1PLU8nKSkgbW92ZSA9ICdsb25nIGNhc3RsZSc7XG4gIGVsc2UgaWYgKHNhbi5pbmNsdWRlcygnTy1PJykpIG1vdmUgPSAnc2hvcnQgY2FzdGxlJztcbiAgZWxzZSBtb3ZlID0gc2FuLnNwbGl0KCcnKS5tYXAoYyA9PiB7XG4gICAgaWYgKGMgPT0gJ3gnKSByZXR1cm4gJ3Rha2VzJztcbiAgICBpZiAoYyA9PSAnKycpIHJldHVybiAnY2hlY2snO1xuICAgIGlmIChjID09ICcjJykgcmV0dXJuICdjaGVja21hdGUnO1xuICAgIGlmIChjID09ICc9JykgcmV0dXJuICdwcm9tb3RlcyB0byc7XG4gICAgaWYgKGMgPT0gJ0AnKSByZXR1cm4gJ2F0JztcbiAgICBjb25zdCBjb2RlID0gYy5jaGFyQ29kZUF0KDApO1xuICAgIGlmIChjb2RlID4gNDggJiYgY29kZSA8IDU4KSByZXR1cm4gYzsgLy8gMS04XG4gICAgaWYgKGNvZGUgPiA5NiAmJiBjb2RlIDwgMTA1KSByZXR1cm4gYy50b1VwcGVyQ2FzZSgpO1xuICAgIHJldHVybiByb2xlc1tjXSB8fCBjO1xuICB9KS5qb2luKCcgJyk7XG4gIHJldHVybiBtb3ZlO1xufVxuXG5mdW5jdGlvbiBoYWNrRml4KG1zZzogc3RyaW5nKTogc3RyaW5nIHtcblxuICByZXR1cm4gbXNnXG4gICAgLnJlcGxhY2UoL15BIC8sIFwiQSwgXCIpIC8vIFwiQSB0YWtlc1wiICYgXCJBIDNcIiBhcmUgbWlzcHJvbm91bmNlZFxuICAgIC5yZXBsYWNlKC8oXFxkKSBFIChcXGQpLywgXCIkMSxFICQyXCIpIC8vIFN0cmluZ3Mgc3VjaCBhcyAxRTUgYXJlIHRyZWF0ZWQgYXMgc2NpZW50aWZpYyBub3RhdGlvblxuICAgIC5yZXBsYWNlKC9DIC8sIFwiYyBcIikgLy8gXCJ1cHBlcmNhc2UgQyBpcyBwcm9ub3VuY2VkIGFzIFwiZGVncmVlcyBjZWxzaXVzXCIgd2hlbiBpdCBjb21lcyBhZnRlciBhIG51bWJlciAoZS5nLiBSOGMzKVxuICAgIC5yZXBsYWNlKC9GIC8sIFwiZiBcIik7IC8vIFwidXBwZXJjYXNlIEYgaXMgcHJvbm91bmNlZCBhcyBcImRlZ3JlZXMgZmFocmVuaGVpdFwiIHdoZW4gaXQgY29tZXMgYWZ0ZXIgYSBudW1iZXIgKGUuZy4gUjhmMylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNheSh0ZXh0OiBzdHJpbmcsIGN1dDogYm9vbGVhbikge1xuICBjb25zdCBtc2cgPSBuZXcgU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlKGhhY2tGaXgodGV4dCkpO1xuICBpZiAoY3V0KSBzcGVlY2hTeW50aGVzaXMuY2FuY2VsKCk7XG4gIHdpbmRvdy5saWNoZXNzLnNvdW5kLnNheShtc2cpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RlcChzOiB7IHNhbj86IFNhbiB9LCBjdXQ6IGJvb2xlYW4pIHtcbiAgc2F5KHMuc2FuID8gcmVuZGVyU2FuKHMuc2FuKSA6ICdHYW1lIHN0YXJ0JywgY3V0KTtcbn1cbiJdfQ==
