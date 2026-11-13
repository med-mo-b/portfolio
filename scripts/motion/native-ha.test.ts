import {expect,test} from 'bun:test';
import {sanitizeDashboard,buildStates,createFakeHa,MAP_URL} from './native-ha-backend.mjs';
function fixture(){return {views:[{title:'Fixture',cards:[{type:'vertical-stack',cards:[
  {type:'custom:eg-floorplan-header',covers:['cover.fixture'],up_script:'script.fixture_up',down_script:'script.fixture_down'},
  {type:'picture-elements',image:'/local/fixture.svg',elements:[
    {type:'state-icon',entity:'switch.fixture',icon:'mdi:lightbulb',style:{left:'98%',top:'99%'},tap_action:{action:'perform-action',perform_action:'switch.toggle',target:{entity_id:'switch.fixture'}}},
    {type:'custom:eg-shutter-icon',entity:'cover.fixture',style:{left:'99%',top:'98%'}},
    {type:'image',image:'/local/fixture-device.svg',device_id:['fixture-device']},
  ]},
  {type:'custom:eg-home-panel',vacuum:{entity:'vacuum.fixture',status:'sensor.fixture_vac_status',battery:'sensor.fixture_battery',map:'image.fixture_map',rooms:[{name:'Fixture room',area:'fixture-area'}]},kitchen:{dishwasher:{entity:'sensor.fixture_dishwasher',device_id:{id:'fixture-device'}}}},
]}]}]};}
function world(){const demo=sanitizeDashboard(fixture(),{svgDataUri:'data:image/svg+xml;base64,PHN2Zy8+'});return{demo,states:buildStates(demo)};}
test('native dashboard aliases entities, not service names, and replaces source geometry',()=>{
 const{demo}=world();const stack=demo.config.views[0].cards[0].cards;const plan=stack[1];
 expect(plan.image).toBe(MAP_URL);expect(plan.elements[0].style.left).toBe('29%');expect(plan.elements[0].style.top).toBe('22%');
 expect(plan.elements[0].tap_action.perform_action).toBe('switch.toggle');expect(plan.elements[0].entity).toMatch(/^switch.demo_/);
 expect(plan.elements[2].image).toStartWith('data:image/svg+xml;');expect(plan.elements[2]).not.toHaveProperty('device_id');expect(stack[2].kitchen.dishwasher).not.toHaveProperty('device_id');
 expect(JSON.stringify(demo.config)).not.toContain('fixture');expect(demo.roles.some(r=>r.role.endsWith('.vacuum.entity'))).toBe(true);
});
test('native dashboard synthesizes device values and an invented vacuum map',()=>{
 const{demo,states}=world();const panel=demo.config.views[0].cards[0].cards[2];
 expect(states.get(panel.vacuum.entity).s).toBe('docked');expect(states.get(panel.vacuum.battery).s).toBe('84');expect(states.get(panel.vacuum.map).a.entity_picture).toBe(MAP_URL);
 expect([...states.keys()].every(id=>/^\w+\.demo_/.test(id))).toBe(true);
});
test('native actions affect only the in-memory backend; dashboard writes fail closed',()=>{
 const{demo,states}=world();let receive;const replies=[];
 const fake=createFakeHa({config:demo.config,states,resources:[],scriptAliases:demo.scriptAliases,log:()=>{}});
 fake.attach({onMessage:fn=>receive=fn,send:value=>replies.push(JSON.parse(value))});
 const send=msg=>receive(JSON.stringify(msg));const light=demo.config.views[0].cards[0].cards[1].elements[0].entity;const vac=demo.config.views[0].cards[0].cards[2].vacuum.entity;
 try{
  send({id:1,type:'call_service',domain:'switch',service:'toggle',target:{entity_id:light}});expect(states.get(light).s).toBe('on');
  send({id:2,type:'call_service',domain:'vacuum',service:'start',target:{entity_id:vac}});expect(states.get(vac).s).toBe('cleaning');expect(states.get(demo.config.views[0].cards[0].cards[2].vacuum.status).s).toBe('cleaning');
  send({id:3,type:'lovelace/config/save',config:{views:[]}});expect(replies.at(-1).success).toBe(false);expect(demo.config.views).toHaveLength(1);
  send({id:4,type:'unexpected/write'});expect(replies.at(-1).success).toBe(false);expect(fake.counters.stateChanges).toBe(3);
 }finally{fake.cleanup();}
});
