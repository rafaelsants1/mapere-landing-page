// Mostra o texto exato a enviar à ElevenLabs (creative_generate_speech), a conta de
// créditos e as frases com as pausas. Não chama a ElevenLabs: isso é feito pelo
// conector claude.ai dentro da sessão do Claude.
//
// Uso: node _motor/voz.mjs 04
import { frases, textoDaVoz, confereTelaEFala } from './roteiro.mjs';
import { lerRoteiro, pastaDoVideo } from './palco.mjs';

const roteiro = lerRoteiro(pastaDoVideo(process.argv[2]));
const erros = confereTelaEFala(roteiro);
if (erros.length) {
  console.error('Tela e fala não batem:\n' + erros.join('\n'));
  process.exit(1);
}
const texto = textoDaVoz(roteiro);
const lista = frases(roteiro);
console.log('--- texto para a ElevenLabs ---');
console.log(texto);
console.log('--- fim ---');
console.log(`${texto.length} caracteres: ~${texto.length} créditos por take no eleven_v4, ~${texto.length * 2} com 2 takes`);
console.log(`voz: ${roteiro.voz.nome} (${roteiro.voz.voice_id}), modelo ${roteiro.voz.modelo}`);
console.log(`${lista.length} frases:`);
lista.forEach((f, i) => console.log(`  ${String(i + 1).padStart(2)}. ...${f.ultima}${f.pausa == null ? '' : `  [pausa ${f.pausa} s]`}`));
