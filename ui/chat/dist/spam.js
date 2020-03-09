"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function skip(txt) {
    return analyse(txt) && window.lichess.storage.get('chat-spam') != '1';
}
exports.skip = skip;
function hasTeamUrl(txt) {
    return !!txt.match(teamUrlRegex);
}
exports.hasTeamUrl = hasTeamUrl;
function report(txt) {
    if (analyse(txt)) {
        $.post('/jslog/' + window.location.href.substr(-12) + '?n=spam');
        window.lichess.storage.set('chat-spam', '1');
    }
}
exports.report = report;
const spamRegex = new RegExp([
    'xcamweb.com',
    '(^|[^i])chess-bot',
    'chess-cheat',
    'coolteenbitch',
    'letcafa.webcam',
    'tinyurl.com/',
    'wooga.info/',
    'bit.ly/',
    'wbt.link/',
    'eb.by/',
    '001.rs/',
    'shr.name/',
    'u.to/',
    '.3-a.net',
    '.ssl443.org',
    '.ns02.us',
    '.myftp.info',
    '.flinkup.com',
    '.serveusers.com',
    'badoogirls.com',
    'hide.su',
    'wyon.de',
    'sexdatingcz.club'
].map(url => {
    return url.replace(/\./g, '\\.').replace(/\//g, '\\/');
}).join('|'));
function analyse(txt) {
    return !!txt.match(spamRegex);
}
const teamUrlRegex = /lichess\.org\/team\//;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BhbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zcGFtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsU0FBZ0IsSUFBSSxDQUFDLEdBQVc7SUFDOUIsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEdBQUcsQ0FBQztBQUN4RSxDQUFDO0FBRkQsb0JBRUM7QUFDRCxTQUFnQixVQUFVLENBQUMsR0FBVztJQUNwQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ25DLENBQUM7QUFGRCxnQ0FFQztBQUNELFNBQWdCLE1BQU0sQ0FBQyxHQUFXO0lBQ2hDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ2hCLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDOUM7QUFDSCxDQUFDO0FBTEQsd0JBS0M7QUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFJLE1BQU0sQ0FBQztJQUMzQixhQUFhO0lBQ2IsbUJBQW1CO0lBQ25CLGFBQWE7SUFDYixlQUFlO0lBQ2YsZ0JBQWdCO0lBQ2hCLGNBQWM7SUFDZCxhQUFhO0lBQ2IsU0FBUztJQUNULFdBQVc7SUFDWCxRQUFRO0lBQ1IsU0FBUztJQUNULFdBQVc7SUFDWCxPQUFPO0lBQ1AsVUFBVTtJQUNWLGFBQWE7SUFDYixVQUFVO0lBQ1YsYUFBYTtJQUNiLGNBQWM7SUFDZCxpQkFBaUI7SUFDakIsZ0JBQWdCO0lBQ2hCLFNBQVM7SUFDVCxTQUFTO0lBQ1Qsa0JBQWtCO0NBQ25CLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0lBQ1YsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3pELENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBRWQsU0FBUyxPQUFPLENBQUMsR0FBVztJQUMxQixPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFFRCxNQUFNLFlBQVksR0FBRyxzQkFBc0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBza2lwKHR4dDogc3RyaW5nKSB7XG4gIHJldHVybiBhbmFseXNlKHR4dCkgJiYgd2luZG93LmxpY2hlc3Muc3RvcmFnZS5nZXQoJ2NoYXQtc3BhbScpICE9ICcxJztcbn1cbmV4cG9ydCBmdW5jdGlvbiBoYXNUZWFtVXJsKHR4dDogc3RyaW5nKSB7XG4gIHJldHVybiAhIXR4dC5tYXRjaCh0ZWFtVXJsUmVnZXgpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlcG9ydCh0eHQ6IHN0cmluZykge1xuICBpZiAoYW5hbHlzZSh0eHQpKSB7XG4gICAgJC5wb3N0KCcvanNsb2cvJyArIHdpbmRvdy5sb2NhdGlvbi5ocmVmLnN1YnN0cigtMTIpICsgJz9uPXNwYW0nKTtcbiAgICB3aW5kb3cubGljaGVzcy5zdG9yYWdlLnNldCgnY2hhdC1zcGFtJywgJzEnKTtcbiAgfVxufVxuXG5jb25zdCBzcGFtUmVnZXggPSBuZXcgUmVnRXhwKFtcbiAgJ3hjYW13ZWIuY29tJyxcbiAgJyhefFteaV0pY2hlc3MtYm90JyxcbiAgJ2NoZXNzLWNoZWF0JyxcbiAgJ2Nvb2x0ZWVuYml0Y2gnLFxuICAnbGV0Y2FmYS53ZWJjYW0nLFxuICAndGlueXVybC5jb20vJyxcbiAgJ3dvb2dhLmluZm8vJyxcbiAgJ2JpdC5seS8nLFxuICAnd2J0LmxpbmsvJyxcbiAgJ2ViLmJ5LycsXG4gICcwMDEucnMvJyxcbiAgJ3Noci5uYW1lLycsXG4gICd1LnRvLycsXG4gICcuMy1hLm5ldCcsXG4gICcuc3NsNDQzLm9yZycsXG4gICcubnMwMi51cycsXG4gICcubXlmdHAuaW5mbycsXG4gICcuZmxpbmt1cC5jb20nLFxuICAnLnNlcnZldXNlcnMuY29tJyxcbiAgJ2JhZG9vZ2lybHMuY29tJyxcbiAgJ2hpZGUuc3UnLFxuICAnd3lvbi5kZScsXG4gICdzZXhkYXRpbmdjei5jbHViJ1xuXS5tYXAodXJsID0+IHtcbiAgcmV0dXJuIHVybC5yZXBsYWNlKC9cXC4vZywgJ1xcXFwuJykucmVwbGFjZSgvXFwvL2csICdcXFxcLycpO1xufSkuam9pbignfCcpKTtcblxuZnVuY3Rpb24gYW5hbHlzZSh0eHQ6IHN0cmluZykge1xuICByZXR1cm4gISF0eHQubWF0Y2goc3BhbVJlZ2V4KTtcbn1cblxuY29uc3QgdGVhbVVybFJlZ2V4ID0gL2xpY2hlc3NcXC5vcmdcXC90ZWFtXFwvL1xuIl19