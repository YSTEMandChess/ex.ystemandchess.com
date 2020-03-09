(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LichessCli = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const li = window.lichess;
function app($wrap, toggle) {
    const $input = $wrap.find('input');
    li.userAutocomplete($input, {
        focus: 1,
        friend: true,
        onSelect(q) {
            $input.val('').blur();
            execute(q.name || q.trim());
            $('body').hasClass('clinput') && toggle();
        }
    }).done(function () {
        $input.on('blur', () => {
            $input.val('');
            $('body').hasClass('clinput') && toggle();
        });
    });
}
exports.app = app;
function execute(q) {
    if (!q)
        return;
    if (q[0] == '/')
        return command(q.replace(/\//g, ''));
    else
        location.href = '/@/' + q;
}
function command(q) {
    var parts = q.split(' '), exec = parts[0];
    const is = function (commands) {
        return commands.split(' ').includes(exec);
    };
    if (is('tv follow') && parts[1])
        location.href = '/@/' + parts[1] + '/tv';
    else if (is('tv'))
        location.href = '/tv';
    else if (is('play challenge match') && parts[1])
        location.href = '/?user=' + parts[1] + '#friend';
    else if (is('light dark transp'))
        getDasher(dasher => dasher.subs.background.set(exec));
    else if (is('stream') && parts[1])
        location.href = '/streamer/' + parts[1];
    else if (is('help'))
        help();
    else
        alert(`Unknown command: "${q}". Type /help for the list of commands`);
}
function commandHelp(aliases, args, desc) {
    return '<div class="command"><div>' +
        aliases.split(' ').map(a => `<p>${a} ${li.escapeHtml(args)}</p>`).join('') +
        `</div> <span>${desc}<span></div>`;
}
function help() {
    li.loadCssPath('clinput.help');
    $.modal('<h3>Commands</h3>' +
        commandHelp('/tv /follow', ' <user>', 'Watch someone play') +
        commandHelp('/play /challenge /match', ' <user>', 'Challenge someone to play') +
        commandHelp('/light /dark /transp', '', 'Change the background theme') +
        commandHelp('/stream', '<user>', 'Watch someone stream') +
        '<h3>Global hotkeys</h3>' +
        commandHelp('s', '', 'Search for a user') +
        commandHelp('/', '', 'Type a command') +
        commandHelp('c', '', 'Focus the chat input') +
        commandHelp('esc', '', 'Close modals like this one'), 'clinput-help');
}
function getDasher(cb) {
    li.loadScript(li.compiledScript('dasher')).then(function () {
        window['LichessDasher'].default(document.createElement('div'), {
            playing: $('body').hasClass('playing')
        }).then(cb);
    });
}

},{}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUUxQixTQUFnQixHQUFHLENBQUMsS0FBYSxFQUFFLE1BQWtCO0lBQ25ELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRTtRQUMxQixLQUFLLEVBQUUsQ0FBQztRQUNSLE1BQU0sRUFBRSxJQUFJO1FBQ1osUUFBUSxDQUFDLENBQU07WUFDYixNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3RCLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzVCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksTUFBTSxFQUFFLENBQUE7UUFDM0MsQ0FBQztLQUNGLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDTixNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7WUFDckIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNmLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksTUFBTSxFQUFFLENBQUE7UUFDM0MsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFoQkQsa0JBZ0JDO0FBRUQsU0FBUyxPQUFPLENBQUMsQ0FBUztJQUN4QixJQUFJLENBQUMsQ0FBQztRQUFFLE9BQU87SUFDZixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHO1FBQUUsT0FB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QUM7QUFFRCxTQUFTLFNBQVMsQ0FBQyxFQUF5QjtJQUMxQyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDOUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzdELE9BQU8sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztTQUN2QyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgbGkgPSB3aW5kb3cubGljaGVzcztcblxuZXhwb3J0IGZ1bmN0aW9uIGFwcCgkd3JhcDogSlF1ZXJ5LCB0b2dnbGU6ICgpID0+IHZvaWQpIHtcbiAgY29uc3QgJGlucHV0ID0gJHdyYXAuZmluZCgnaW5wdXQnKTtcbiAgbGkudXNlckF1dG9jb21wbGV0ZSgkaW5wdXQsIHtcbiAgICBmb2N1czogMSxcbiAgICBmcmllbmQ6IHRydWUsXG4gICAgb25TZWxlY3QocTogYW55KSB7XG4gICAgICAkaW5wdXQudmFsKCcnKS5ibHVyKCk7XG4gICAgICBleGVjdXRlKHEubmFtZSB8fCBxLnRyaW0oKSk7XG4gICAgICAkKCdib2R5JykuaGFzQ2xhc3MoJ2NsaW5wdXQnKSAmJiB0b2dnbGUoKVxuICAgIH1cbiAgfSkuZG9uZShmdW5jdGlvbigpIHtcbiAgICAkaW5wdXQub24oJ2JsdXInLCAoKSA9PiB7XG4gICAgICAkaW5wdXQudmFsKCcnKTtcbiAgICAgICQoJ2JvZHknKS5oYXNDbGFzcygnY2xpbnB1dCcpICYmIHRvZ2dsZSgpXG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBleGVjdXRlKHE6IHN0cmluZykge1xuICBpZiAoIXEpIHJldHVybjtcbiAgaWYgKHFbMF0gPT0gJy8nKSByZXR1cm4gY29tbWFuZChxLnJlcGxhY2UoL1xcLy9nLCAnJykpO1xuICBlbHNlIGxvY2F0aW9uLmhyZWYgPSAnL0AvJyArIHE7XG59XG5cbmZ1bmN0aW9uIGNvbW1hbmQocTogc3RyaW5nKSB7XG4gIHZhciBwYXJ0cyA9IHEuc3BsaXQoJyAnKSwgZXhlYyA9IHBhcnRzWzBdO1xuXG4gIGNvbnN0IGlzID0gZnVuY3Rpb24oY29tbWFuZHM6IHN0cmluZykge1xuICAgIHJldHVybiBjb21tYW5kcy5zcGxpdCgnICcpLmluY2x1ZGVzKGV4ZWMpO1xuICB9O1xuXG4gIGlmIChpcygndHYgZm9sbG93JykgJiYgcGFydHNbMV0pXG4gICAgbG9jYXRpb24uaHJlZiA9ICcvQC8nICsgcGFydHNbMV0gKyAnL3R2JztcblxuICBlbHNlIGlmIChpcygndHYnKSlcbiAgICBsb2NhdGlvbi5ocmVmID0gJy90dic7XG5cbiAgZWxzZSBpZiAoaXMoJ3BsYXkgY2hhbGxlbmdlIG1hdGNoJykgJiYgcGFydHNbMV0pXG4gICAgbG9jYXRpb24uaHJlZiA9ICcvP3VzZXI9JyArIHBhcnRzWzFdICsgJyNmcmllbmQnO1xuXG4gIGVsc2UgaWYgKGlzKCdsaWdodCBkYXJrIHRyYW5zcCcpKVxuICAgIGdldERhc2hlcihkYXNoZXIgPT4gZGFzaGVyLnN1YnMuYmFja2dyb3VuZC5zZXQoZXhlYykpO1xuXG4gIGVsc2UgaWYgKGlzKCdzdHJlYW0nKSAmJiBwYXJ0c1sxXSlcbiAgICBsb2NhdGlvbi5ocmVmID0gJy9zdHJlYW1lci8nICsgcGFydHNbMV07XG5cbiAgZWxzZSBpZiAoaXMoJ2hlbHAnKSkgaGVscCgpO1xuXG4gIGVsc2UgYWxlcnQoYFVua25vd24gY29tbWFuZDogXCIke3F9XCIuIFR5cGUgL2hlbHAgZm9yIHRoZSBsaXN0IG9mIGNvbW1hbmRzYCk7XG59XG5cbmZ1bmN0aW9uIGNvbW1hbmRIZWxwKGFsaWFzZXM6IHN0cmluZywgYXJnczogc3RyaW5nLCBkZXNjOiBzdHJpbmcpIHtcbiAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiY29tbWFuZFwiPjxkaXY+JyArXG4gICAgYWxpYXNlcy5zcGxpdCgnICcpLm1hcChhID0+IGA8cD4ke2F9ICR7bGkuZXNjYXBlSHRtbChhcmdzKX08L3A+YCkuam9pbignJykgK1xuICAgIGA8L2Rpdj4gPHNwYW4+JHtkZXNjfTxzcGFuPjwvZGl2PmA7XG59XG5cbmZ1bmN0aW9uIGhlbHAoKSB7XG4gIGxpLmxvYWRDc3NQYXRoKCdjbGlucHV0LmhlbHAnKVxuICAkLm1vZGFsKFxuICAgICc8aDM+Q29tbWFuZHM8L2gzPicgK1xuICAgIGNvbW1hbmRIZWxwKCcvdHYgL2ZvbGxvdycsICcgPHVzZXI+JywgJ1dhdGNoIHNvbWVvbmUgcGxheScpICtcbiAgICBjb21tYW5kSGVscCgnL3BsYXkgL2NoYWxsZW5nZSAvbWF0Y2gnLCAnIDx1c2VyPicsICdDaGFsbGVuZ2Ugc29tZW9uZSB0byBwbGF5JykgK1xuICAgIGNvbW1hbmRIZWxwKCcvbGlnaHQgL2RhcmsgL3RyYW5zcCcsICcnLCAnQ2hhbmdlIHRoZSBiYWNrZ3JvdW5kIHRoZW1lJykgK1xuICAgIGNvbW1hbmRIZWxwKCcvc3RyZWFtJywgJzx1c2VyPicsICdXYXRjaCBzb21lb25lIHN0cmVhbScpICtcbiAgICAnPGgzPkdsb2JhbCBob3RrZXlzPC9oMz4nICtcbiAgICBjb21tYW5kSGVscCgncycsICcnLCAnU2VhcmNoIGZvciBhIHVzZXInKSArXG4gICAgY29tbWFuZEhlbHAoJy8nLCAnJywgJ1R5cGUgYSBjb21tYW5kJykgK1xuICAgIGNvbW1hbmRIZWxwKCdjJywgJycsICdGb2N1cyB0aGUgY2hhdCBpbnB1dCcpICtcbiAgICBjb21tYW5kSGVscCgnZXNjJywgJycsICdDbG9zZSBtb2RhbHMgbGlrZSB0aGlzIG9uZScpLFxuICAgICdjbGlucHV0LWhlbHAnXG4gICk7XG59XG5cbmZ1bmN0aW9uIGdldERhc2hlcihjYjogKGRhc2hlcjogYW55KSA9PiB2b2lkKSB7XG4gIGxpLmxvYWRTY3JpcHQobGkuY29tcGlsZWRTY3JpcHQoJ2Rhc2hlcicpKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvd1snTGljaGVzc0Rhc2hlciddLmRlZmF1bHQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksIHtcbiAgICAgIHBsYXlpbmc6ICQoJ2JvZHknKS5oYXNDbGFzcygncGxheWluZycpXG4gICAgfSkudGhlbihjYik7XG4gIH0pO1xufVxuIl19
