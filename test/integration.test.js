const fs = require('fs');
const path = require('path');
const EC = require('elliptic').ec;
const assert = require('assert');
const BigIntBuffer = require('bigint-buffer');

const CompressedBulletproof = require('../src/CompressedBulletproof');
const ProofFactory = require('../src/ProofFactory');
const constants = require('../src/Constants');
const Utils = require('../src/Utils');
const Maths = require('../src/Maths');

const ec = new EC('secp256k1');

const fixtures_dir = path.join(__dirname, 'fixtures');
const tx = JSON.parse(fs.readFileSync(fixtures_dir + '/transaction.tx'), 'utf-8');
const serUncProof = fs.readFileSync( fixtures_dir+ '/uncompressed_proof.json', 'utf-8');

describe('Integration Tests with other bulletproof libraries', () => {

    it('Should be able to verify a proof created with secp256k1-zkp', () => {
        const hexproof = tx.tx.body.outputs[0].proof;
        const prf = CompressedBulletproof.fromByteString(hexproof, 5);

        const V = ec.keyFromPublic("02eb754605d4c5453788549d01583c79ebfcb3a5c0a48d5bdb6b52d3bc9eb8e0e0", 'hex').pub;
        assert(prf.verify(V, 0n, 64n, constants.gens.G, constants.gens.H));
    });

    it('Should create the pedersen commitment as libsec for same input', () => {
        //const value = 1234n;
        //const bfstr = "   i am not a blinding factor   ";
        //const bfbytes = Buffer.from(bfstr);
        //const bf = BigIntBuffer.toBigIntBE(bfbytes);
        //const bf = BigInt('0x2020206920616d206e6f74206120626c696e64696e6720666163746f72202020');
        const bf = BigInt('0x2020206920616d206e6f74206120626c696e64696e6720666163746f72202020');
        const value = BigInt('0x00000000000000000000000000000000000000000000000000000000000004d2');

        const pc = Utils.getPedersenCommitment(value, bf, constants.secp256k1.n, constants.gens.G, constants.gens.H);
        const V = ec.keyFromPublic("0364c55f631b81fa2a968cbbafba5451105296fa8cee86206b3afe51d28b11e52c", 'hex').pub;
        console.log(V.encode('hex'));
        console.log(pc.encode('hex'));
        assert(pc.eq(V));
    });

    it('Test the two generator multiplications in the pedersen commitment are the same as in libsec', () => {
       const xBlindGen = ec.keyFromPublic("02744cb23ed3c34c53d86f65457e5dbeafc64eba5cc7988f1ee60578ad8abfde6e", 'hex').pub;
       const vValueGen = ec.keyFromPublic("02a6fc0f2989491a010ebb901011289f29bcfcb34c11cbec4b7785c1a6b9a1254d", 'hex').pub;
       const valuegen = constants.gens.H;
       const blindgen = constants.gens.G;

       const x = BigInt('0x2020206920616d206e6f74206120626c696e64696e6720666163746f72202020');
       const value = BigInt('0x00000000000000000000000000000000000000000000000000000000000004d2');

       const xBlindGenJS = blindgen.mul(Utils.toBN(x));
       const vValueGendJS = valuegen.mul(Utils.toBN(value));
       assert(xBlindGenJS.eq(xBlindGen));
       assert(vValueGendJS.eq(vValueGen));

       const pcJS = xBlindGenJS.add(vValueGendJS);
       const pcC = ec.keyFromPublic("0364c55f631b81fa2a968cbbafba5451105296fa8cee86206b3afe51d28b11e52c", 'hex').pub;
       assert(pcJS.eq(pcC));
    });

    it('Should create the same proof as in libsec with the same inputs and randomness', () => {
        const x = BigInt('0x2020206920616d206e6f74206120626c696e64696e6720666163746f72202020');
        const value = BigInt('0x00000000000000000000000000000000000000000000000000000000000004d2');
        const V = ec.keyFromPublic("0364c55f631b81fa2a968cbbafba5451105296fa8cee86206b3afe51d28b11e52c", 'hex').pub;
        const low = 0n;
        const upper = 64n;
        let rindex = -1;
        const randomness = [
            BigInt('0xe3d1b4510b023c0c5bcffd5a85698fc9c59f3be1cbbd5c56b89006b46c4c26f0'), // alpha
            BigInt('0xf61d5d355a1f9f3670108ca96c0c6193ccc93e90a98baef4f3f854217214e402'), // rho
            BigInt('0xe7f4089281a6bfb9bfcd7c5e21d5aadd58db9ebf7747ae6e89d204d5b9cf36b8'), // tau1
            BigInt('0xd4876ca1278bb82c586cb084edfbcf4fd640114191da596720a0e914b434a828'), // tau2
            BigInt('0x604843eb0e5964792a3bbed974976667ac076ab117a44c04c84f135918a177ab'), // sl, sr vector values
            BigInt('0x0e5133815328eda36b5b44a8bc698baa7f8bf95d98e6f58f5793458d4fb55760'),
            BigInt('0x3b8b63c3faf311a14e4f00cc4587bfe427eb77e05b40f8131675f828bf7dfd45'),
            BigInt('0xcabdf43d0bea7f175df363de1f0beab94f7dcccef353fd53968cc2c964547044'),
            BigInt('0x54a0dba29f091d0aff1a1000bafa72d3ac05d43776556c523fe5839e544a5f46'),
            BigInt('0x23688d95ca29cc44ec7479809229c1b00f51cc59c9a778aae752ddcc44945612'),
            BigInt('0x2e359a339050b1eac22104627e97785cfd6bf8abfe2e27ff4a38e70c652f0088'),
            BigInt('0x9d7ebf12a25abc1887c8a73d9e2676310ff6295cc68b4d3e70099e5d72ebb04f'),
            BigInt('0xb85ec115c5870e2d90e40c92623d62397ccf1b787057cffc37ae7d43e14c0794'),
            BigInt('0x27e0080f39f4cc47853e0693420f5c5a58e0f23c875b3028a6d45e0fc453ceba'),
            BigInt('0xf8b423f66e61f562fbdb00c6e02ed64236a376d074aed68b57baa7f170d9dd20'),
            BigInt('0x095109dca0105b315087f907ea89254133e7d30aac1cd5629f993a87585ba030'),
            BigInt('0x00e40c1e6b1ee07144c1b5e272a64f4b63797f81bdfb8a5a6fbd9ae12a14ff9f'),
            BigInt('0x7a6e8faf805d37a911b02b626e1b72dbea154593d115bdc4f9e5c8cf63849089'),
            BigInt('0x103180dfafb1fabb01cba895d465366dfc0c2cc81d06bd9de64c888cb59c5e7c'),
            BigInt('0xa35dd85c4d0b6f405af6744f25c9d52a08d1117faf97b61d9caed66195f5cc2f'),
            BigInt('0xa4d553c3b04a7d810e5c6f1796dc90a0bb02420f263c18351f4cf5ff18331b67'),
            BigInt('0x2325b6fb5fa3d220658844a520ef0199c1567585f816dd08acfb81d6ee16bc97'),
            BigInt('0x070c825b5184ac39500ba654fcfe0e1466c65b8bd984728fcf29a7ddd09bfef1'),
            BigInt('0x0a4330cdc96d6681077d377fb57d400100005a8a9ff4cc422051aa0b485c61fe'),
            BigInt('0xf78ee7e97286733bedb9bf982f3c6de436f7b3eb17f2a0ae5d3d35636d49fe18'),
            BigInt('0xd56b0b63aef8bf91b03212683447c6506ba8243a1f3419ae81760042fb1804f9'),
            BigInt('0xd67fcc19bb613d7ce7f36b7534eb665d7aefb0d3ff6eb2b0ffac6a0dd9b239b5'),
            BigInt('0x5be97cff3ce5ae192c65024757a27a9c5fb5db057b7f07c7cd7f9fb5dfc64ff2'),
            BigInt('0x1f0b62916b62c160ee287789ad069317ed4a94fcbe6290d027151e4c0514c442'),
            BigInt('0x54b31aa12f10c2687188c9b3c4885f61ffb1f2db44f9b9a4f36694d2e696fd71'),
            BigInt('0x7cf540813f766a2cd9f8791e6ddce7319e9d90e7478308c6a584b46681bb4a4c'),
            BigInt('0x1802a9f69a834478c34bc40cbad215a83d41451645ad8889f3a167f9ba0504db'),
            BigInt('0x6e974a1ecd1c64eec7d75379129dfd48df069bfca764d7ad71089efd2ec28bbd'),
            BigInt('0x53638c2d5872e5c595b753f19202d1d03682b6e7c7253bd32d86ed977f73e1c5'),
            BigInt('0xde52b30da956dcab31ff7d9fb6a6202e07ca0d1e23c7c72fb5e19370b8eff60d'),
            BigInt('0x7157227bb2ba03687a578639a1959d3c7871e13715e90c7405cc26b19f8f092a'),
            BigInt('0x9dcc69435f9ee35c3c61dd0db95d6b18431ec24a0a1c527a77e3e595bb2f05c6'),
            BigInt('0x9bab0dd4871d67b02752b1600171638fa4e0f0b5f6500d4c971d970931055494'),
            BigInt('0xdf927c7ac8c2d9bf604cd5142c3aeb3a96436e1b443a5177eadd6b87f5a587ab'),
            BigInt('0x1884c9f0ec81c7dc5dbcb9b03c5c79a85ec7524620db78351ccc07d9f80e365c'),
            BigInt('0xe3752f422e33c872dec4e4469a44a2cc2746c1da876977ec4fb91ab3f6cd13d9'),
            BigInt('0x6966619c4db7c46c7d1f915bd3efb512cb8ed1c97ecd293cb0dada418418d5f1'),
            BigInt('0xfc70cae85f807848242676fef0faaf836c467c3ea8ba15599c5a4c5785757ff1'),
            BigInt('0xb2523f82e81883cd767a38ae143c1370548e3e9130c7ab3a238784f259b6232d'),
            BigInt('0x99b3f3cfa6a7613a9591001512edec803b44bdff04b3a07f90aee7c3670c9d50'),
            BigInt('0x074bb7bc06178ed17c76b48b2892d02ae576d2e31f0806e761460775d7cea2b1'),
            BigInt('0xd32c7f0f7ae491939a93afdda6c89bbc08c770a452bae05673057df62713feaa'),
            BigInt('0x5ca63411fa11b1e71f9e335c8b200586d6580256353d39934ecd4a9a8e7d0cc5'),
            BigInt('0x596df5b90df5c5db50c663bf7902bfb1fa86564d9bd432a58da9023b83089008'),
            BigInt('0x54b81b905ef745d0399c79a25d4049d5d2c0a996f52f7aaf112e07ce9b7f4f26'),
            BigInt('0x93b6cacd0a7eeace96351868f9414f1468fa6e8f0098676a37ab83c92f661378'),
            BigInt('0xedb69af20ec1e0ffa4f91fb601a83719401ed9f93848196e99f0cc1cedda78aa'),
            BigInt('0xa45ecca90e4a40ecb6e4254cbe3d5354a5cb55f5b7f90c43e4bf18c525798272'),
            BigInt('0xeb20e7d6983eb667a8de5a234fd198874988f5d448b6befcba4e70de83067f44'),
            BigInt('0x72226513f545b6e6ae52d7d8b74640c61d9da5e06563cbb40e19de8836364d30'),
            BigInt('0x1f90bac5ecd6e71e95871faf65c8701eb578a155b32238a8b1ee5a59b8c1c2e9'),
            BigInt('0x7c1bc7da9201c101e1947ae1bdc9fd73d3ef682d92bfc64805915966196d0a2b'),
            BigInt('0x86d2ec191bd0ab2dec6807c2e3e9c84b4d4abf94e11a24ba50cf89dcda6f7f75'),
            BigInt('0x491717803ab3df4fd6b73dd5cc2c7779aaa77b05f2fe4d4e7072bbb2711e0c3f'),
            BigInt('0x64130a73867af5a351537bf6d4a9cfc9dec408db15b8d399c7057163bae6d8fe'),
            BigInt('0x14438c2c43d15416e5c80c3f68572f263bea3db540ca80e78660a86c71e39245'),
            BigInt('0xc06781801e2a5b292b9f4c18a94dcd212843b60aa7d0bfc834e21d0b8bf3ff4b'),
            BigInt('0x1c1f6155636daaecb35cc1acd6dd1c4b0ccca3320715d9fc1cda5f2cc9afd0ab'),
            BigInt('0x8f930a7ee5528d6b4104feea9a16e7dd5b36b4b3ce31b6af7eb3a2f521f2eb87'),
            BigInt('0xddc5500af01b38238c573f7ef65930ba0bc9299756d74f9b038434053b70343e'),
            BigInt('0x2edc2d88fecf441dd996e4be4a609effc1edd9cff6dd887e723b29ae65fe901f'),
            BigInt('0xcb2013906ebf2fede0db37e29813a2f6471241977c9135fd6b9fddd2623ca230'),
            BigInt('0xb9fcf9ac746ddc2da1d26c9eedb1e27050cac0ca25d32a60f68f6382635facf4'),
            BigInt('0xdb7f6444af28f7376e2579e284df65ee20550d9aeedc0fb11aff8dfba03dbe71'),
            BigInt('0xdf7414245ff65aaaf77f07e13eb45dfc02c39dc5618dd2b29d98bce9e6172bbc'),
            BigInt('0xd8bc8c5195684154bdec8b58c28e2aaef1e0eedbc08ea3efa46effcaecd05966'),
            BigInt('0xe717ea4728cd043ddeb2d91afef7bb39b3fd5a66edaebabd8c6e27208bd8f38d'),
            BigInt('0x3af038bb5bcd402c1fc1674074b2e4a731276340e2101a610b055315c6a52c46'),
            BigInt('0xf727f771fcaf56b917d45a2e7f7802a29417383a686b9ad8c5d4a5a5e773b516'),
            BigInt('0xc44f9b0436181a78ce174a574654cee15de9da3399ffbf31df3c987a96101709'),
            BigInt('0x7a9d88414ff8a260421cf5be330141a8d696adf9e533adc753ccbbc02381eb45'),
            BigInt('0x5c341dd184969157748f70de9388cd3d6cc77764abb96eb09dc3de9a378541dd'),
            BigInt('0xce57a19041c2ff888a3013b2b04c266ce31c0b46de59e1a946a0336dce4b4d74'),
            BigInt('0x936e06293a072b686e4be744a141a26ec65f42b7b604b759a9d483def453a3a0'),
            BigInt('0x3d31372d9cb2c7ccdf16ac8dc899d3c2bcb265270927aba204d2fbeb73aa8d7a'),
            BigInt('0x1bb336eb2e3ea64792f59716dfab2cd266532ccd96c55394da27bdac71464f22'),
            BigInt('0xcf039b23e507f021e68df20ee2c7c561ae5750c63cfff1c4db5c1067124f2df5'),
            BigInt('0x7c253d58532540d502b0e00e72eab64386f0a1e010b0df508341f4c4d80490b3'),
            BigInt('0x9079905ea42eadc8152746381c872f5611f0060f208f86e14d77a37c635953a7'),
            BigInt('0xee3e52b586bd0cab2fb636d1e056d44558d11fa0777e3d1f5e27961736ec1615'),
            BigInt('0xac02728f6acde65d12fa4196f324c7cfabcf95ae597989598af3152887b556af'),
            BigInt('0x82956cbc9ba94964147900f793409f955a2b6e0309b27c4e46f23e4d833b86aa'),
            BigInt('0x5c6538b6e3c5a92aa8a428b6686acd33ea206009179d4d897db1f4921f6123e6'),
            BigInt('0x6b74f2ce7a7604e2a2705c68b707e3b6ee1d603e3772a169fb84994cd17ab2a3'),
            BigInt('0xeee04b1ee9f361c97ed40f52445083ca0d460cd10353ddb7c6c0cf45d104cadf'),
            BigInt('0xed1ee04188ebd5f225a4e432b2bc22de64591d13180c7f967d21b80f17f01ff6'),
            BigInt('0xaa40acc52fc2874a0672121929f370d545ec56fd9795238abf6e01d2d0771445'),
            BigInt('0x0d35c3804c475ef335f1717453b2af73bc58867803c62e2f2652094ae45ddb1a'),
            BigInt('0x05416c4e4a18dba7f42e515155fcfa46502899166e3f5b4b5f603ee148662297'),
            BigInt('0xa46295cba78ac96d08d0ecdaa91106ebf4c6e331bf7b4ce4701aa32992d9fb44'),
            BigInt('0x68519125a53a842bf5c6cc74b409535e94aad82b28665eb9855b8e5ed16ca127'),
            BigInt('0x0acce46cc8c2eb7a87f188ba3fd609c7b4ad0738dcc1a04d91bb3424ab7adf53'),
            BigInt('0xe28a6f2122712cdb59745b35da5f03de83d317e0cc47e6522adcb3569db75ddb'),
            BigInt('0xbb47873471e72230fcf271ae1604ff84b88224ebe6ab04a7a520633784b1c825'),
            BigInt('0x3cc0dd85b8f0d396f67af4986165a42ea1e36bb364d3099bd077b17f39e2b260'),
            BigInt('0x65dec68ee3a395eba74d332a5613f1912958cda02f83104fc37196176c27d404'),
            BigInt('0x7f4a1e24856db54b1e8f57b6e63c8e1724b9a349ce0f2d5ac3264a7d0d47db97'),
            BigInt('0x323dc2ace76c6fe4e3c88bb11339dc148c9fa181e9dee8d74f1c94ed4af1e0bf'),
            BigInt('0xa764baab401b4cb299954255c34702ecf67384b87935afa48958a16138ddd1c2'),
            BigInt('0x23d06776f2c19b084b4a5c2894193b23c4b2dc1c283ee27de24299ffe8b46a8e'),
            BigInt('0x5f169911384d915a7c3e999fd51020fd3a759fbbbd65b67eb48173681593ce86'),
            BigInt('0x4a55dd6c1c32173a14d711cdd2939394f0135fc5aacd478e7807eaf4446b6c0c'),
            BigInt('0x3dd968da0072da2922fe7df5584ebc0d57ad271207e745d9c829e71df798b267'),
            BigInt('0x82f7f3a28e665c42c9f3f73ac1652b5721762269c5c337c54da27f3682f337a2'),
            BigInt('0xae78414df3958575923abac1d3a7a4a4f2f2387913a1629c0071d5e621d3e971'),
            BigInt('0x55e37172e1df92231d0d5c7de017fa8d4020550a1a3cdc3b7c8b9ab634682609'),
            BigInt('0xfc71fd09ecf6ae2ce40a35f51f68c84dc0c56e223f4f4309548b2cf3fb466036'),
            BigInt('0x08d237348823856de87fdb880037c8d18913b300f91ef8329163b56420569f2f'),
            BigInt('0xee64ac45b8d60c840eaf94345f940a224e4e715156e622420e9d8154ac735b0d'),
            BigInt('0xa87085b630b8e37af8537f59bfb01955cc0323a5c63cd3424852fa241f84e3ca'),
            BigInt('0x6746dda2ca065c10835bd2258ff27e722fc890c01cc40702e422dfb860a9655c'),
            BigInt('0x5b1a3d8def2e4d624847b88e1e8e69a826e9f1234f21616a517a2329c2ee6381'),
            BigInt('0xa2b5597c73ee88d651104675e75470e89924405b3ea35e2441dac21c82c203bb'),
            BigInt('0xc19b294fcb203fc10dd11e1cd7d88d3f17434b49d0a269b0e08849f61cea3a15'),
            BigInt('0xe1a8deab385bd438ed35cfbb9894051d3af99eb445ee0a6764888d06da6aeb70'),
            BigInt('0xbe9d51351c4568d2c8b39d422640fee219e5ae3d339c4d68a9bbe2c8c0cfebd5'),
            BigInt('0xa74b69b7a905f0ee12e500f1d19993b24105b8b21b446a6ad6e8af882325b7d3'),
            BigInt('0xf9103c230f55b96f053d004d4f882225e2804878a7b9ce14f3e2a729d390aabf'),
            BigInt('0x42079646b8fc2965f314141edce32f7522c6a276f9114a8a46575465e155c4b2'),
            BigInt('0xb44800ddb8adc03ee2e4e54a560835074036b21e5d9967f0a88ec7956c249ffd'),
            BigInt('0xa97fd6b072d9f32089bc849d589eabcf3cd28c4067df5e0de051f7dda97e7e5c'),
            BigInt('0x3d61ffb5b7c9f3e8124b4e4e50e8d10d73fe6e0a5cc8b2b8bcf622bd99512d75'),
            BigInt('0xd6d03456ae7f0d0ad14b57964ab6303b9281a8a20f755c2f9a988f2f6ebe1465'),
            BigInt('0xf2f19252378d74c0f3bb72224e3de328553fb19c0aafffb5caf3f92a1757a892'),
            BigInt('0x2e3838bd63be1dd71f43453b29a44ab79d114653b50519b289f9234683143959'),
            BigInt('0xee4371ba6548e54d2627cc82bd5cad27697274f611c29dafe17f1583ebb6a290'),
            BigInt('0x5de43031a3e4a4d0caae38646264a6c58824365ab3596dd8b44fa3e5659ff4a6')
        ];

        const prf = ProofFactory.computeBulletproof(value, x, V, constants.gens.H, constants.gens.G, low, upper, constants.secp256k1.n, true, () => {
            // All randomness is fixed with the values from libsec test
            rindex++;
            return randomness[rindex];
        });
        const compr = prf.compressProof(constants.gens.G, constants.gens.H, true);
        const bytes = compr.toBytes();
        const libsecbytes = '25e5c9cf69466a75d725d7006ef0f5ee57e5bd4ad0e18de257331ae3f265afabf9f3bee4cd8f183e2cbf60cf08191bf323f7ffe59d5a350d2af8a12ac0abf5ed04920a7d89bda141d43d950061a72dd73363c7cb8ee71054a649d7762ad6c70139256c25fff3a4e2e70590ad99a1a035558821418e19adc740579080da5a44a03252aa74c248c889c0b1da8a05038dc0434535fa922a2ad1528d40a048976c2c7d59de0212236c0b796850ab4719bd482a88bd837e7ea2ef2d54c8b9b765b91d835a09346ff7bd9bbc43af274ecdc6c2a52bbaa019f729fc25348f5cfdf159703757ab66f4e49c88a203f1eecfa679e763b1100f90e0afef9ccc1ec2cf74cf17ed8cf53af8bda5197c0f6bf5e428e7350b7f43f896d687fd506bc5730b838ac87f3ad8399b3f7c36685fa465104cc02b9884990ec2cb008c205748bacf31329815959cf25783104af70d5c46d3af1f378202f59c80a7df7bacb0ba24ad82f61bfd2500a175e4766e36933c00aa65a570aadf4d3cd9782bc6dc670db94ea3d13d08780538d99cf14b1b48ead09f8eb4acf4fda16d571fb611eef3a13beacc935fe6b29b34496b6840520fbb7b142e672989a6888240d385408924ae24ffc2e015c5be7076c4624a5a75d566f865c600e3a078318ede63c1c7cf8027b3a5f1b55ca693a5090e7c9e534cfa7926d746ede5298b60ccbbfb1c3162073bf55e9d60550baf5be0448c8e9f6399d9ecfb538d0a17834c2514d25bc3011e45f307f68345b321bb43c00c3aaf1ed81fd8611497489ba93096ee16d58b2a0935c1f186cf7e5f7e4c29eb1b93bfdfe8bbb1178792f00a33b6c7469f142521e3cbdd49d69720a0edead54b963388506a291843f296d02eb533ec2ca5a1dbdc3294a8f0976aa9024901e52f7763cfc51345fc032297c5f8033da4fb0f3f6e14b2afaddd5b9e9c6cd8dc';
        const comprC = CompressedBulletproof.fromByteString(libsecbytes, 5);
        console.log(compr.toJson(true));
        console.log(comprC.toJson(true));
        assert(libsecbytes === bytes);
    });
});