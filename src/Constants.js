const EC = require('elliptic').ec;

const ec = new EC('secp256k1');

/**
 * Secp256k1 public parameters
 * p is the prime of the group
 * n is the group order
 * @type {{p: bigint, n: bigint}}
 */
module.exports.secp256k1 = {
    p : 115792089237316195423570985008687907853269984665640564039457584007908834671663n,
    n : 115792089237316195423570985008687907852837564279074904382605163141518161494337n,
};


/**
 * NUMS generators
 *
 * H was generated by sha256 hashing G and coercing a y point
 *
 * arrG and arrH are taking from libsec and are NUMS generators calculated by sha256 hashes and
 * using shallue van de woestijne algorithm, they are used as base points in the vectors G and H
 * in the protocol
 *
 *
 * @type {{G: Point, H: Point, arrH: Point[], arrG: Point[]}}
 */
module.exports.gens = {
    G : ec.g,
    H : ec.keyFromPublic('0450929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac031d3c6863973926e049e637cb1b5f40a36dac28af1766968c30c2313f3a38904', 'hex').pub,
    arrG : [
        ec.keyFromPublic("03b34d5fa6b8f3d13849ce5191b7f67618fe5bd12a88b20eac338945667fb33056", 'hex').pub,
        ec.keyFromPublic("02628615169242109e9e64d4cb2881609c24b989512ad901aeff75649c375dbd79", 'hex').pub,
        ec.keyFromPublic("02ede06e075e79d0f77b033eb9a921a45b99f39beefea037a21fe9d74f958b10e2", 'hex').pub,
        ec.keyFromPublic("02c6eafdcdbe7e16d9501a091666bacd5e18408887147f176789aa73bcc01d2d8f", 'hex').pub,
        ec.keyFromPublic("03021ac016d4ee115fda3c91e4123d55cedacba7f6210ef2fd76923a3c868c233a", 'hex').pub,
        ec.keyFromPublic("02b8b80de36adcb4131f3f4641210b5a0722e94cf46e29405cdc805a40f936640d", 'hex').pub,
        ec.keyFromPublic("02466feab83d73f9878f346fcc77196ff644a5a017bd143bcc5fe3e433ba36040c", 'hex').pub,
        ec.keyFromPublic("0226d905d00319815940c76c607ff042793a45f019f692beaccbc2af3f17583196", 'hex').pub,
        ec.keyFromPublic("034650ee17f60d027ea16048b0a2618d458b2ca4c9885e625e74a2a08e6866c487", 'hex').pub,
        ec.keyFromPublic("0209147c3dda51dafe93e5b365cdbbd10034c84c73723893e1f8776f885396b9cb", 'hex').pub,
        ec.keyFromPublic("0296de73b729fa9fe9006b15a82013c05d5d63a2cae82120283a1168da35f11cbf", 'hex').pub,
        ec.keyFromPublic("0292a4a5fdc922f5d895201462cc765da99e995a8880a88271a8a4cbd61db54b8b", 'hex').pub,
        ec.keyFromPublic("03ea9d7f546a9b7b8de0ab20db6eca5704de7b146ea53bfbe12aba3e0a97192679", 'hex').pub,
        ec.keyFromPublic("03c386a347ba8648caea2a0e2cd57d5b82253095df5bb7875ab48954f1c3af20da", 'hex').pub,
        ec.keyFromPublic("02fc2ef9183bde7f8667b6f715134011dc1638b69a08670c568e7b7b3a8444fd2b", 'hex').pub,
        ec.keyFromPublic("0362eb7055644132adbb51413d06c3d9ee8afb67d9290571c87854c58e1aef6ab0", 'hex').pub,
        ec.keyFromPublic("03e544d5a49093b1b1b39cfed5f2ed3b054f794670f8a39cfcce103a62abb71026", 'hex').pub,
        ec.keyFromPublic("021e95a08b43f935a1743f43d2cc9f7f41bf6ecba708840bf140d1578e0ce1444e", 'hex').pub,
        ec.keyFromPublic("0275365410862640259d5d08199e9016adad690e381861b2889d5c68b3303c964b", 'hex').pub,
        ec.keyFromPublic("02ce34ac56013744f3b183b2e12c8cb2060169fea1d93b37b90ec99b52dbd765e7", 'hex').pub,
        ec.keyFromPublic("02fee81db75a103602b70751e0bff7fa58ba16d983fb4545ecd63a8df89216545d", 'hex').pub,
        ec.keyFromPublic("03774d8710ccd52773f2e4577aab1a32be2c8621d8fdd85944ada1dd80b482c972", 'hex').pub,
        ec.keyFromPublic("02d8831d17314d67f991d237e83378199d9f0401a445c7b13389c4310193ab5fa9", 'hex').pub,
        ec.keyFromPublic("0268a10fa1477246248d0100536b11e3d1abcfb9036e8fc7ed5aac74f56d06a6c9", 'hex').pub,
        ec.keyFromPublic("02362477ca7f3b4d012270f94f6d7aee042068f58022cdd04a06c54c654b9c9a53", 'hex').pub,
        ec.keyFromPublic("03a7d790062cf5f6034ad72153bfc08b4799a4cd1976e1eae9a81e5d9861d4b593", 'hex').pub,
        ec.keyFromPublic("0310eaf97cbea82f7c00791bae4bb1ebffd6fab5d4e3984ac40cb9cbfbe414f8e8", 'hex').pub,
        ec.keyFromPublic("020d65831f3304045f1d4993d6f7b678d6f4dd48b6682a3a7daea662fbd9172281", 'hex').pub,
        ec.keyFromPublic("03411d6fb290ffed92a4a910ba5f7d36d751e00a424b8f3f1c9ce3bef6f03fcb84", 'hex').pub,
        ec.keyFromPublic("03d6154754830f3109e1c4f951eb00c0223ee125f8a285d87016b87dfdfd9e16bc", 'hex').pub,
        ec.keyFromPublic("02228ca6134b34950313c1c04d9d3cfc97d3e90189815189be01518dd3f95080a8", 'hex').pub,
        ec.keyFromPublic("0285f57a5ee9f9aacf5a20508f6dc493314cfcc297fbd60fe7ef7b2f2e2ee65ba4", 'hex').pub,
        ec.keyFromPublic("02ef31e37499a003c1723e1434f39cdecfd7268dbe69329041d55a79a03aba0a11", 'hex').pub,
        ec.keyFromPublic("0351fc143e9ea71b276f1147da89f804cd66707f49fd69d9ecb4aa9cae1bf3f062", 'hex').pub,
        ec.keyFromPublic("028b469a83bf19eaec6086d2464deb89d33ddd3cb904f0fd2f5083bc6125994109", 'hex').pub,
        ec.keyFromPublic("037720a7ec479ed373adfe04ba470d9d99ffa48f2455d9e61ebada844d5fbcbf58", 'hex').pub,
        ec.keyFromPublic("03a78dea8caddb4165af5e80d7042d222eeb1c6719dbc4259cdbb382b1f9ef8404", 'hex').pub,
        ec.keyFromPublic("031f9410e25035771b109baf7d1d38328bc582a0a15d282aa160f38c1c41435c76", 'hex').pub,
        ec.keyFromPublic("03ecfdbf1e7e7f42c13503e365c95eac5c7d867c91546cf0abaa8c1f8ea221cf05", 'hex').pub,
        ec.keyFromPublic("0233d913562bf1825549f7fd671e903f1105e08b8353399ce8fb0293a0ef0a942d", 'hex').pub,
        ec.keyFromPublic("032d78e0a9207897b7352cc3d92389d854d21d978367169d9a9be26138f7bf4bc9", 'hex').pub,
        ec.keyFromPublic("0399c887c2f36c93aca704e08741730d5a235c84c8bc6c84f9d5e02c0991f073b2", 'hex').pub,
        ec.keyFromPublic("036d95df67c7bd45b9b7b46673f9532bc3d1ec708dd48b336bef85ace05309343c", 'hex').pub,
        ec.keyFromPublic("03d7de5a0622577f928900bb4d0f9dcdc9a15492816b1569d646ef90e702ccc88a", 'hex').pub,
        ec.keyFromPublic("02e676b6f9a3e9d47ab2a5580548415e48ea170fdea0c975cebd465facf199a4e2", 'hex').pub,
        ec.keyFromPublic("02ff206978b0b9fa8f39c35ad2c617834189afbb456c3b596441745811904bdcea", 'hex').pub,
        ec.keyFromPublic("038b9bcd31b973cd74875d2e7634d9362a6585a89fcf149b6b4d9ebf03607695b4", 'hex').pub,
        ec.keyFromPublic("02e0024437cdb5d433bb93e37e0efea6c896d2243dd924af8bd8e9ea482000ec11", 'hex').pub,
        ec.keyFromPublic("03ac96876f2436e601f3b8fe6a24e4ad64193b0a9d83777a1fcd8a867822f269a3", 'hex').pub,
        ec.keyFromPublic("0220bd8092c55a6bcc3363af25205aef6172181bea9d87c511dc47a5ebde667f1a", 'hex').pub,
        ec.keyFromPublic("028a5c186b4fd65cc6b2a17a767d7d077e9294e8638cfb54de20ab084cd773d094", 'hex').pub,
        ec.keyFromPublic("0256a178b80d003d3424210f3937a16722692d7f4e5dc1de87d7cbf364cc59ad72", 'hex').pub,
        ec.keyFromPublic("0209be3659858b0239a5fa9c96b1984a297a18c86e04896936eb00f6c437fba308", 'hex').pub,
        ec.keyFromPublic("032740f48a89cb1d157697bca728239d82ccf8b6b94ce7c2e45c3c31a328afbdfe", 'hex').pub,
        ec.keyFromPublic("03b644039d77e7905f4adfd56cbff1ef8fc25c90fa887400eae55cde9649a8f48d", 'hex').pub,
        ec.keyFromPublic("03aae1b9df991399dd0afa5002de3170bb3256410d0614a98807a9f5b4a4efb10b", 'hex').pub,
        ec.keyFromPublic("023038a217e8cdab7c4ff4448bf000e4bd699228a5442b4eee28732a686e6d3e85", 'hex').pub,
        ec.keyFromPublic("0251d276d50ad951cd90bc27488c531d0974990e7d5b2120c8f7aa3bdef9ec7d6d", 'hex').pub,
        ec.keyFromPublic("03ed021bb961d66544e81f4364f3a82901a21e0d47dd05e86be6660227541ccee2", 'hex').pub,
        ec.keyFromPublic("02daf826226ce773645cc8f261bd2e3f35310026d14463c75f48253145ab88db1d", 'hex').pub,
        ec.keyFromPublic("03a9acb6eda302fdd8b60946366a56622cbec0d007ff17239a48e967fcb80e0a49", 'hex').pub,
        ec.keyFromPublic("030d0b0ae91b71b4dc0a5666b5b6006fa33d6a0a0f0559e1b0e0f1b34e8de6e3be", 'hex').pub,
        ec.keyFromPublic("03c9500f0fd704638ec61849d3b29491b1b88e43ad3009933de5b8820c7f27032b", 'hex').pub,
        ec.keyFromPublic("02b80205909a989c879f9ca37e01a0e42dee2630dfb584031705dd24fb3170f790", 'hex').pub,
        ec.keyFromPublic("03d23fd9b9c9e080b591d1e7399707ea13bb16992a8b9683d719b36b56aa0ae7dd", 'hex').pub,
        ec.keyFromPublic("02e9a261db89d15881f373c531933a3ea40175a6bc44b52750389e97a1f8363e1b", 'hex').pub,
        ec.keyFromPublic("03db95f1dcc1f3e8a81b12a15b9dc29ca171d013c072665a40c84ebe93ea03a7a7", 'hex').pub,
        ec.keyFromPublic("03672260061e446c6764052ade9b87c96addff339d767b4c0ee1f03222431ec661", 'hex').pub,
        ec.keyFromPublic("0306f51f18c3025b83835cbdad731efe96eabf73903ff8a512a86983dec7b907b3", 'hex').pub,
        ec.keyFromPublic("0390ee6dcdd4472249ab485c04990b6554e2ea3de59a356ecb389cfeb5660dade1", 'hex').pub,
        ec.keyFromPublic("0369f06d86b75219964302b65a2ae5f19e755339798afedd6ada1e1ce0020150f5", 'hex').pub,
        ec.keyFromPublic("0270e6b60a9b643858a3a76c78fc68c19810553e94152b2a9270da2d434a850356", 'hex').pub,
        ec.keyFromPublic("03ec2124fa106721e11dc0849e1f3368a42f4d89e50db59383e5029af2239a99a9", 'hex').pub,
        ec.keyFromPublic("0258aabd897e19b51a04990bf4e9fd268e2f4852063334cb8c031d61f9dcf5c792", 'hex').pub,
        ec.keyFromPublic("02eaefc49a39cf89185e22762647c16706678c1e546c5e8c532d111e2f1c4f29fe", 'hex').pub,
        ec.keyFromPublic("033af3726e89ab7ffdea23c83e505cb2a4129fdcd0e1202621cc6551c5c011488d", 'hex').pub,
        ec.keyFromPublic("0378efa08c29da18ec42b41855aef2c27c7cb3b9f8b0f2efe80536af01e3423c9e", 'hex').pub,
        ec.keyFromPublic("0318d986a249a4f81aa89b12efbd22cfd7bfc404458736a8958d0cf49bd4e3cc68", 'hex').pub,
        ec.keyFromPublic("0377edf26a922e96a1c8528c96d8568157eea58712afc898d1621b96bfa8195014", 'hex').pub,
        ec.keyFromPublic("021002a9f749b1a60f67ed6f8f08e7a1a952d5e4c71b35d475ae0cb031596219b1", 'hex').pub,
        ec.keyFromPublic("03b2c62ad517e39f41f992442bf0d84b45cabc7a1dd8cd34a81f33af28ff5784b5", 'hex').pub,
        ec.keyFromPublic("024b52fac1c2a0847bbdfe9b82839c5618198f0c56540d74372bcd5aeeb790b21c", 'hex').pub,
        ec.keyFromPublic("039684d760e42a370146a025baad15e026487c2894657ca9ab6f6e28e843c7f665", 'hex').pub,
        ec.keyFromPublic("031cf30cf15755f2988822076a99848c2c40bae34caeb30e15290624f9ccf80490", 'hex').pub,
        ec.keyFromPublic("02b5da035961b58fcc6c2c020f97514e790d614fb711c004fd0f36b43d2c01fa78", 'hex').pub,
        ec.keyFromPublic("03b829e6e0697a6be27cad9ab39daab682726c265676dcc38b7fa3354de16cab27", 'hex').pub,
        ec.keyFromPublic("03bc859f24965081b6ce9ec8c51f852553bd37ce475772af08953ba40eec6e95f6", 'hex').pub,
        ec.keyFromPublic("03e6fc5e8ed08422d6efc68edcc43df3068a49932e485b00997dc57c23305ee722", 'hex').pub,
        ec.keyFromPublic("026e8088769797e98e21d671fad0c0974d39ca7d49382630ba61dd73f5aac30e9c", 'hex').pub,
        ec.keyFromPublic("02494232a2d6b84d7cd414a98607c388161ed177f7b6bf1f5f1effcc4337b61aa8", 'hex').pub,
        ec.keyFromPublic("02088d25b4b81b241632c022cccbafb019d54c835474cf35842b0c02e2509b3ecb", 'hex').pub,
        ec.keyFromPublic("02a698d55603705db1c9814fcb63b58b62857bfce1a5b7ab81dc002ab8c0a2bebc", 'hex').pub,
        ec.keyFromPublic("02dd2811ba4d7144e4fb154e4ad014366fe6e3dabf1847f0c54adb21c31a41f592", 'hex').pub,
        ec.keyFromPublic("03f4c2fe3c6f888dc234f911e004d64abfc256c1d04ab8fc9c97e2202e7280050a", 'hex').pub,
        ec.keyFromPublic("03c68f8482dacc5d1c94d77e65f7f0aa1b150b41b535cfe0ea3959cfd214e61920", 'hex').pub,
        ec.keyFromPublic("02472494ee484c1de26713e3fbe561ea4a438623e194f633c70eb51579e39215e7", 'hex').pub,
        ec.keyFromPublic("034c25de3d154079e720aa809a6fbcc7765a66992e4b472c68e9ee533540901d22", 'hex').pub,
        ec.keyFromPublic("0242512e31303b622ac2c3292bb9145904789f834635cdf6b27f9c9085ba98c67e", 'hex').pub,
        ec.keyFromPublic("032e0102baf9010780c3c9efaf31a106a77ba4c27b2205174e631600ab3f23a418", 'hex').pub,
        ec.keyFromPublic("02d267dabddfc591a58df296c49b04d8f935545a2acb983f524f00c376935c1bce", 'hex').pub,
        ec.keyFromPublic("03966e473fb9eb3493cd16acb40d462fcf68fbffdfaecbcb23fc19ed39a573a090", 'hex').pub,
        ec.keyFromPublic("02b9ec5d921fa43881c1a852217e5f814ed1761a2c02c6c2772857979a4f30a158", 'hex').pub,
        ec.keyFromPublic("02b32375b5d0d218b236621e3cc87c3572c094cad2483ac85e93d4ec13f2dc51bf", 'hex').pub,
        ec.keyFromPublic("0300068c3d87b2dd305bd2d3838294483c50532fab1c861f4b66872306e3a0debd", 'hex').pub,
        ec.keyFromPublic("02f43888c50ce3645c6fb4a3a25c312784df426c0a3743c963aa92edce826b839a", 'hex').pub,
        ec.keyFromPublic("03276020310192694464fd1b028959f38244b0b124d842f2d3dba16ca8a1309642", 'hex').pub,
        ec.keyFromPublic("031d2f4dd18890af6d6722cafb4c78b8b7ac99394e455381ad8bbe5ac26c5fde96", 'hex').pub,
        ec.keyFromPublic("0324eadc43474d994c612c32fc27e58223815ee7953e998b621c609d1ad4672656", 'hex').pub,
        ec.keyFromPublic("03539e53477126da3e6c2dc407951bb01895e6a1b0a0bb3122c4577d0acb0efbb5", 'hex').pub,
        ec.keyFromPublic("02473f28755f1ab656deed11f301c24bfc92940e41b7917fe59598b704d750b2f1", 'hex').pub,
        ec.keyFromPublic("032988dd1c4464a7a6b76e50083012518565aa4cbe32a8d9eeb58d2a8970cf7832", 'hex').pub,
        ec.keyFromPublic("02d53c11196c58e8b8d7e3983763594106b5db1ee7627e7317f13a9d7da0367cb5", 'hex').pub,
        ec.keyFromPublic("03a11cd7858586c141320b649698410a04f104bdb2d6603a22bdf943183acfac73", 'hex').pub,
        ec.keyFromPublic("039012901076b2b3f421f6d37af236148ff09d65ad753448a61d11310417cf9de6", 'hex').pub,
        ec.keyFromPublic("0250093e8ec035c4266c3679286a7da3e611d9d8ba4cb9329ff4ab9897333e5f9e", 'hex').pub,
        ec.keyFromPublic("036196760d9bdc2deb9326cdef1ae3cc7a47de95dd3686d067ae272932143538ab", 'hex').pub,
        ec.keyFromPublic("026acbea6c701f0dd9ff49c222ca28aaa577b2794932f0bf4eec7b993f8bb3a1de", 'hex').pub,
        ec.keyFromPublic("025a40296973b0b0eee1929a65ff9e9fc9ce0d5d0e496bfdf67daf58a571a851f9", 'hex').pub,
        ec.keyFromPublic("0218a5b9f69af5af93d8c7cc18d4609d783e5d63eb7e3d85bac7c33a1a2ab818e9", 'hex').pub,
        ec.keyFromPublic("029a318cb82dbc993c2d9b2a69054bd965379739126672ab55b03e36a457310aff", 'hex').pub,
        ec.keyFromPublic("031690ed13ba44ca51944a638b6efda058453f3999644a70de7cf478d4a473e410", 'hex').pub,
        ec.keyFromPublic("031e39d6d387424ab0dd38be7d915d860a7ec38e74fc961a2221b50fb9933ffaf2", 'hex').pub,
        ec.keyFromPublic("02bc124d53a4306cea8401e9bd3e303199f3dd432bba1d00c1501090dea474e2de", 'hex').pub,
        ec.keyFromPublic("02c0241c7c554c4d0524144de57d26405be7336611f96c6d309f2000e2f5b0960d", 'hex').pub,
        ec.keyFromPublic("03a1b39739379ff998ce3f7ea74855f10f28e53da8df1948def7fd455ead5ebad2", 'hex').pub,
        ec.keyFromPublic("03fd470ff629893d51813d239fa5c3e50b1ba9baafc6e671938f3db4675dc6b854", 'hex').pub,
        ec.keyFromPublic("03a1d23840847ef5b4775e3adf842e3a7801f2be720bfb33cf2253fd24342df37d", 'hex').pub,
        ec.keyFromPublic("028f49118f067e8636309708ea034c24269dae4692641cc0ca3cb9b692f7cec8cb", 'hex').pub
    ],
    arrH : [
        ec.keyFromPublic("022224027aaeed035cdcd5deb0b905e2168147133a291d59ea43e83f01b86de45a", 'hex').pub,
        ec.keyFromPublic("0205b69004ba4cba10b101c6e0215483251b97eee664ed379e4c956710177d3380", 'hex').pub,
        ec.keyFromPublic("03d4117a88f295e692782e91d3611f6babc7be132bd2f22df73337221adcf05fa0", 'hex').pub,
        ec.keyFromPublic("0368d51fa9eb73c687680958cd9c66f77a114624ecd38846d0eb442e75589b6898", 'hex').pub,
        ec.keyFromPublic("03211c0bfc13e06c22867b4882899aa64787742709c54ccd4d69a89d4277526f3a", 'hex').pub,
        ec.keyFromPublic("038bd88c3f4946de7f0f8edb7048bf9d6f5378ce009ba926e2fb2da6ee632e0f5a", 'hex').pub,
        ec.keyFromPublic("0221c58b75de16ac712f282df0603908329ce97b40e5f2ffc01f797f24b2d3f17d", 'hex').pub,
        ec.keyFromPublic("030352a38545b3ba644af3781ebb3d088c698431a7ab1378b559d2422ab8d64ae9", 'hex').pub,
        ec.keyFromPublic("03df0825474f8b7464f67f43328f76760f1d361f388bf3c40c1a22b86d2457b281", 'hex').pub,
        ec.keyFromPublic("03d74a3f36816eea583550ae374494fe7e9e6b2eb9de0e11b332aaee692a243676", 'hex').pub,
        ec.keyFromPublic("0301248d42d32a601ea2ee2cb7ff5c24ca99f22562de2f86f3d3ca99eaea4368f8", 'hex').pub,
        ec.keyFromPublic("02ad78fcafe8cc72709cf8ab0a619be04ad10cd671df0a4dfb2416cc74af6277b2", 'hex').pub,
        ec.keyFromPublic("02f5bf990d7797aa7623c10fbdb447c5387f55af7ffe73ea8421f0d34bb817aa87", 'hex').pub,
        ec.keyFromPublic("02a99acc546f29abc3cba2fbc053d4f8bc4a3a3c0360a35a79e0f6496daa41cd0d", 'hex').pub,
        ec.keyFromPublic("0376d186c88fd52303749bf460afac329e4114e9e2eceb1d0406bdc8b476e1b0e7", 'hex').pub,
        ec.keyFromPublic("0321f97ff78dc71f28ac7c6aca32cb9956713798f25d0c4cc2a54d2a8351477dba", 'hex').pub,
        ec.keyFromPublic("03d424b9b5392bb48cb6e894e79b8f348448e4e45c65f327a3570631633f835315", 'hex').pub,
        ec.keyFromPublic("036aec785ff3d1abd8af17719d8e10d1d801d316ddbf273d2d7268aa2a7c316ad2", 'hex').pub,
        ec.keyFromPublic("03cde8eedd8d8e01256ed062ad76237c4df1e9c717a3438f47fe1bdaaeb9d58979", 'hex').pub,
        ec.keyFromPublic("030c0dc8874ba88b2899cd33c3eace8287709609ea828de43570fd2c4b07fd5ae2", 'hex').pub,
        ec.keyFromPublic("0394a881f17f7a2430a95906166ad181f59987000475fe43b6275b0ea84435eec8", 'hex').pub,
        ec.keyFromPublic("0378222a9e07793f4677c9d8844eb4de51ead543d60953424bdee1aa6b39a42e54", 'hex').pub,
        ec.keyFromPublic("033e6fd14a245b1e0eb6e7f85f469b5b90d433d6faf4e55a24daafcb77077bcc34", 'hex').pub,
        ec.keyFromPublic("021114873a77a2a579b74ea8a7790806f9f13a2cf9d3ff5f9f6903c05382d1d4d7", 'hex').pub,
        ec.keyFromPublic("02c46b55261d19d941fa76c9a790d1024fe5cf989c7ad928d9797ef519dafcc536", 'hex').pub,
        ec.keyFromPublic("03a633bcf370952382b0a96958a9f6e2d331afc676b7fa7e8b32d1a52eae34b425", 'hex').pub,
        ec.keyFromPublic("0278c043bdb3c1e564eb0eb04711c7e6a65b723319e3dd52ab355047b994d303ed", 'hex').pub,
        ec.keyFromPublic("03b0f3195ea9d9e3629c1acf94bcbf0e7134633ac7e2383f15bdb013a2e2ad47c4", 'hex').pub,
        ec.keyFromPublic("035dab5602ed4301c4feff42c70682b6c2042b989e06b535c5c446393ede514f93", 'hex').pub,
        ec.keyFromPublic("027e14f96a3e512c209ad1c7f6f558cc368afd257d5f3d30c4cbbc4df165a9caa3", 'hex').pub,
        ec.keyFromPublic("02384f5674b6423bab5cab381df1a97071f1c1615986d1b47f6fbd2304d00dc5c3", 'hex').pub,
        ec.keyFromPublic("024007c8f91d5234ca7698a5b936bfcd131581b6aa182f4ba43aaf9021fd69e3e7", 'hex').pub,
        ec.keyFromPublic("036ed60422be5597f6cbcf622634ba6677f367591cee55de10bccf2b42900049a4", 'hex').pub,
        ec.keyFromPublic("02459161ef3e3eb9012dae18991a774e7fd4ebe4437cd9dd2872bf71b82ec08a93", 'hex').pub,
        ec.keyFromPublic("0246d602edaae6b402e039b1179b2daaa2d07c617e5c083f78bf7c6433b27be788", 'hex').pub,
        ec.keyFromPublic("03c4c3654d36bda9faee26ee8290cb6feb706c646e73a3f223b0c79623b630d323", 'hex').pub,
        ec.keyFromPublic("032c1033058ecde3ab0061dbcfeadd67031006d77af84f44700eb0b9ec7d5952f1", 'hex').pub,
        ec.keyFromPublic("025be88224a64959aab7496b40faff9a5bb1addc884629c3d5fa9bd0fbdc1dd333", 'hex').pub,
        ec.keyFromPublic("0343b3d48b14b3849ec5ff83b06a113cbbca9eb3501ad4a8b56baf1af365bfa100", 'hex').pub,
        ec.keyFromPublic("03b3c0476462b4f8c64ea62857eed99a7e9994ad136b580019ea655db18f0495ff", 'hex').pub,
        ec.keyFromPublic("035d062076248bcb90984e6b42874f83887c2a7b6f817a0fca68f964a6858cff3a", 'hex').pub,
        ec.keyFromPublic("0369134f22b96f72076328ad2a52a8775c9f4743dba1f4e377f816b88e448ebf73", 'hex').pub,
        ec.keyFromPublic("02cc6e91638ed706f3e1ae517fc27c3fb08f92bcea1ddebe15b69b7c090d11a9d1", 'hex').pub,
        ec.keyFromPublic("02a1ec60bdffbc0138d3b7a279f669a5f831ab951a6a199893ce1b7e65d0e4588b", 'hex').pub,
        ec.keyFromPublic("03cea467473913822e213f21f78effa41e7963fa9ba5f1eb6b1ea84c90a4085a3f", 'hex').pub,
        ec.keyFromPublic("0362b285c12f79ea3b8ac13ff20ea043ecfbd117fdaf99779a018d6980666d4dba", 'hex').pub,
        ec.keyFromPublic("03bd5af8a7226ab1affd081108fa12aee025ae64f6de8c5b88794f63e23fe9c993", 'hex').pub,
        ec.keyFromPublic("03aa888a36d6afffa882730a8cae5c3c6f50bb4f1907d77357ee4b2fc5a9734323", 'hex').pub,
        ec.keyFromPublic("026dabfb47e4210553819d4664e53b461ecffbe70ae854d7cf2bb37af69b626157", 'hex').pub,
        ec.keyFromPublic("02d4376d5679002ca142f5806daf2b290c9336abe83f731f66dcf8baa16d1e0346", 'hex').pub,
        ec.keyFromPublic("022fdead2726462487131db607dcd64ec31e58a0c8437d534868b5f5fb1dcae273", 'hex').pub,
        ec.keyFromPublic("027e4123a3809539cf229d798a5c4b4ee4b51241a87d4e15e4c63e3d764ffc0b52", 'hex').pub,
        ec.keyFromPublic("036ba02818f79666ed83c19ebb01ec26337cfb957c28bbdc7106c1a1169cf881bf", 'hex').pub,
        ec.keyFromPublic("020bcaeca67805cb4252277abdd1135811198892c3211117d120df26fcfa25997d", 'hex').pub,
        ec.keyFromPublic("033fe6c35715fe751997a6159cc1e5d6f6874499df681744bc65dda2ac2f7ca9f6", 'hex').pub,
        ec.keyFromPublic("0242b7d08f927972a26b4433642f7b99a057c2a2e87dacd1d1e56cb22d6665879f", 'hex').pub,
        ec.keyFromPublic("037804a62b819f1d6901c242fed44457b92afb22096288f785c313229404078c67", 'hex').pub,
        ec.keyFromPublic("022126e9291978c29c02a8dca3b2d4607064d8db84487a3208936114a66de8ce45", 'hex').pub,
        ec.keyFromPublic("033a9ef92425545c06dfa7bee199dca1fc360653b8b9d25103d90f107695b98cb9", 'hex').pub,
        ec.keyFromPublic("03322b7c74e2bddd8c044a85cb2c6832a72bbd402bac7195c6da86a0b035f08b4d", 'hex').pub,
        ec.keyFromPublic("02ab3aabb2a9c476b8750c892bf3f0a230e7efb1c18fa6daf5397bd79e98f9e5a9", 'hex').pub,
        ec.keyFromPublic("0369c4dab6fad829d128d1d13b94c6c57b9abf036471815be21b90e802d96fb5ad", 'hex').pub,
        ec.keyFromPublic("031fd7cde815a98d41daea8a8efdab5a08c28ecc7a707fa6509906550b32fb2f79", 'hex').pub,
        ec.keyFromPublic("0216b8c3f3772a3a8a5a1f355bfa8be20bb7045ead383a7ac5663fe455088cbee8", 'hex').pub,
        ec.keyFromPublic("038fde0b0a3c783ffef1b934333571386fe99f34862347e3f7fc3ee20f86b3ab17", 'hex').pub,
        ec.keyFromPublic("025122c29b513cada21aa107fae447718a7e8867d74b804c054aebbe13c8cb14a4", 'hex').pub,
        ec.keyFromPublic("02d4fab557cb3bfddaa7bc520153c072f63ba8c088bd192b16b091bd6b8d008114", 'hex').pub,
        ec.keyFromPublic("0385eef9fe96e3380acd6b1ff6b1ec6e905efb7efc2316d95223118a6813c59109", 'hex').pub,
        ec.keyFromPublic("03de91a414efc776f612b4d894718494e764503d1d1fec64065a8570b88ee59afb", 'hex').pub,
        ec.keyFromPublic("027263b2b3b7de50b16089760805fc40d4338afc3aadcb39ccbfaa4755ad263cb1", 'hex').pub,
        ec.keyFromPublic("033957fff3cd9627874ee0fc4f96723fab848f53967878360b59fda684a3c72b85", 'hex').pub,
        ec.keyFromPublic("02b19dfa05f1a5cb5624f807cdad09025acef4eff3b2f1de11a77b06508a3a7adc", 'hex').pub,
        ec.keyFromPublic("02ad75abba98d146916ece8dd760236a06f1ef311ca5e0afa94c0e86535d8c8b63", 'hex').pub,
        ec.keyFromPublic("02c6886bc9da8785ae80dfb25d18055b5e357f8d37f396813e6a89497dd37e68e2", 'hex').pub,
        ec.keyFromPublic("02d5fab4c8147e31bde2147c6c2e496fb526776f9088f8ff042c38c1f60ea14816", 'hex').pub,
        ec.keyFromPublic("03d4d5e962220587db1cdff5c9661da848f8cfd24c2635c7d832f3303131a44902", 'hex').pub,
        ec.keyFromPublic("029c7ae9351e1e3ab88b4d691bde699cb48fb4c7e1d322ddb6b3bc96dd05fc0991", 'hex').pub,
        ec.keyFromPublic("036048521cee3aea4a9d12121771a1ea2443197295cd0d79f66c88b52ae6dfb5c7", 'hex').pub,
        ec.keyFromPublic("03f1cfbd4928659d0cddba239127979b34a806f11f8bc9f3b9f3e9f27a540d3d0a", 'hex').pub,
        ec.keyFromPublic("027e8e40ce861e0bfe52587ad8568236b4077644da59390e95858db84bf224b79f", 'hex').pub,
        ec.keyFromPublic("03872ed0325aa86c305f9eeef06c135692b80a137267c1b96daccbe0b3e9c0be54", 'hex').pub,
        ec.keyFromPublic("03dfb08ec103a164784b9ae4187a843fb8353f56d8b64ce59cf92f0a92a03cb7bc", 'hex').pub,
        ec.keyFromPublic("03ac547336c448efcc418c580496a2380c0adbef42df4cdcf89bb67dee44b06445", 'hex').pub,
        ec.keyFromPublic("0288b16030344d7c5a83dfa622d24212904cf5ba5d55f3f5eafb79f4279080284c", 'hex').pub,
        ec.keyFromPublic("03110797df83231bd074dc3cc447244a0589cdf4b675c03af643495c1485312576", 'hex').pub,
        ec.keyFromPublic("038abd5ecaf9845c0f3a1ee255466580ea016bfb80f43a5c2470b859595762ccd0", 'hex').pub,
        ec.keyFromPublic("02b0e1fb2f1d8900f7c7b0b6881b797b18ce36403c49cdfc420e1e2e2e3dcd3144", 'hex').pub,
        ec.keyFromPublic("03cb7e78aa9c6754888ad343cbb2706820dc8557a3a8a0a9f864eec110df6473ed", 'hex').pub,
        ec.keyFromPublic("034bdf182c111c4543b1d93ad134e0c46b651345a29fd24fad778743462b2510a1", 'hex').pub,
        ec.keyFromPublic("03a4ed96f01e91dc94cd7f46dd45a78c984768ce1ccb88d4380deef90467dd0371", 'hex').pub,
        ec.keyFromPublic("02d964e410f9506f16cc28847f014f248dfd4ab475cae589493cce29cbb23428d2", 'hex').pub,
        ec.keyFromPublic("0378f22997120464ee7a5d421b0a2fa5a466e1d5c1323a23ebed6eb6c988274b49", 'hex').pub,
        ec.keyFromPublic("0335dc2fe32985105352802c68ae574d9c017f5c82701a3e2a9d56b2e297429e4b", 'hex').pub,
        ec.keyFromPublic("025f7ede66433fb06112f5cdba04538f547328b747cdfd1cd943c7e41960482e6b", 'hex').pub,
        ec.keyFromPublic("02cec4ea0ce641e4ab30f16e1296de3d772c5a8505e418483076543940254cdbf3", 'hex').pub,
        ec.keyFromPublic("039db4776f83bc3cae755857a4c21e0d27e3a06c3f4bdf52ac8d14c276f7a71709", 'hex').pub,
        ec.keyFromPublic("02873d6d588d8d1e003f11e0ec5eb8f2da74fdd17045eda9789105e3032f31725d", 'hex').pub,
        ec.keyFromPublic("02c3d8422bc12686c3a8a2e1c52f2aa1aaba0be41fd6b070c7c9693c14d4a5b6c8", 'hex').pub,
        ec.keyFromPublic("02a889168225181c9ce0234d93fc2a77177426cad6e5ad73de04ddaced2de591a0", 'hex').pub,
        ec.keyFromPublic("036b5e1713da47f4ab62cd73dd3dc47b6f67a6dff2558462e70af562a511e8c372", 'hex').pub,
        ec.keyFromPublic("025eefb4e717fec1059375fe49c2568e586cd21a21c4eba3aea71b839d8bc02ac3", 'hex').pub,
        ec.keyFromPublic("028a2fcf57e17f74fe03e2b110683935a25923aa020535be4cf58c9fd32b26b3b1", 'hex').pub,
        ec.keyFromPublic("02e0ec5cbb042584650a4bbeaf7038508170eab534bae95c26e70788602774440c", 'hex').pub,
        ec.keyFromPublic("03b4ce9fcffd8a4b7d50e7dadc3e0dce23d0afae43e230c824fa97a78f793a6976", 'hex').pub,
        ec.keyFromPublic("0286d6d2af3335b40b348af9eb7461c5bc7bdb8732b6262d89e12dbd8b538210c4", 'hex').pub,
        ec.keyFromPublic("02c1e64438bb562c60f818547652c909a50287f2fdb3532830b45a8f5d2c31f0ae", 'hex').pub,
        ec.keyFromPublic("039a392830d65dccd9a6041d6362cea141f94c17d3710a27ece887737d50f84019", 'hex').pub,
        ec.keyFromPublic("02934d4dc18bd80e5bbf84de1d72df996e79a942922aca7ac012a99c662b6943d8", 'hex').pub,
        ec.keyFromPublic("03072559f46cc1c7db17c8b301304b2b382a5ecf1fdc7ad225fbffe12838d76339", 'hex').pub,
        ec.keyFromPublic("039b10fb8591295e3e988657e94683f12c5f1958ec9c5603772b63fa6ad152a0ed", 'hex').pub,
        ec.keyFromPublic("03ac32fa43c8145ec198a4399a052f635420018a54d5987577f93bc187b5aaca72", 'hex').pub,
        ec.keyFromPublic("03a60aab7b60ffa4a47fa759cde3501ba0cd03b89a3e7bceaff589cbfe9ce68a00", 'hex').pub,
        ec.keyFromPublic("03176d6e691222b9119e61419230a80a4bcfd306e700d3d3f682b602271c503d2c", 'hex').pub,
        ec.keyFromPublic("03bac595ca905ae02a685f8ad09a91abb4c0faf440e1284e1f70cb3fdeac6fd6e2", 'hex').pub,
        ec.keyFromPublic("03f994da6c90e47dce3aa92ea25b49d4d3fab77976380093477bf3e3c8cd945b1c", 'hex').pub,
        ec.keyFromPublic("035669bf6519ffe8e0fd776b8895ac9a531115af7650d3f8b38a87e4e575ce4865", 'hex').pub,
        ec.keyFromPublic("02b01b31e350a0e11f0a1e9c5af78a77e077d0ebc75a3e89fa7e66ca20df48046c", 'hex').pub,
        ec.keyFromPublic("025e501347c1bb48ea287e6bca5eb70a6e448122add85203d767282db504f5d986", 'hex').pub,
        ec.keyFromPublic("029ed5153e2db9ad12a7016f628605dfd4bc143862e697eff866b946419f74fde4", 'hex').pub,
        ec.keyFromPublic("03fba7e317f6bfcece9aba880ab345ab02017ea1b268011a026dfa18d2d5e83f2b", 'hex').pub,
        ec.keyFromPublic("029d89e6c9a4b5bd6cf189171a28c974af9269738178c6688915a6996f7101784a", 'hex').pub,
        ec.keyFromPublic("02f6e93cdd3b27bbc0cf48988a52f097bc28b72fdef41172c8cba3eb32a32596d4", 'hex').pub,
        ec.keyFromPublic("03995a8e407d53ff341d5772c4001678000b3c9b12b4eea71824d1fcb0aeb1f320", 'hex').pub,
        ec.keyFromPublic("031fb51708af548db0a011d417e3b4bb9d2e3370a3107d8e1d47ea6074bdec598a", 'hex').pub,
        ec.keyFromPublic("03235642b4a111d5225d8d51fdaf829ffd21ea4ac71ff5497b5c82c4d9e6a14220", 'hex').pub,
        ec.keyFromPublic("034686feb74508785692a52cfeeb3c5a401f00f11e2b2d2432d6522ab06b0deb5c", 'hex').pub,
        ec.keyFromPublic("03041d5b3989f8c7b26c5ce63a468528ec1ba5446a42cb9db768831092e8ceab61", 'hex').pub,
        ec.keyFromPublic("02242cdce4b5605f85498c014b78dd29b1ce1a88e361199b5a98be64cff233f976", 'hex').pub
    ]
};

/**
 * Other constants used throughout the library
 *
 * @type {{END_VECTOR_LENGTH: number, FIXED_INC: bigint}}
 */
module.exports.essentials = {
    FIXED_INC : 142n,
    END_VECTOR_LENGTH : 2
};