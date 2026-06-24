/**
 * Appointment routes — drop these into your React Router v6 setup.
 * Example: paste inside your <Routes> block.
 *
 * import { Routes, Route } from 'react-router-dom';
 * import AppointmentList   from './features/appointment/AppointmentList';
 * import AppointmentDetail from './features/appointment/AppointmentDetail';
 * import Booking           from './features/appointment/Booking';
 *
 * <Routes>
 *   <Route path="/appointments"          element={<AppointmentList />} />
 *   <Route path="/appointments/booking"  element={<Booking />} />
 *   <Route path="/appointments/:id"      element={<AppointmentDetail />} />
 * </Routes>
 */
export const APPOINTMENT_ROUTES = [
  { path: '/appointments',         component: 'AppointmentList'   },
  { path: '/appointments/booking', component: 'Booking'           },
  { path: '/appointments/:id',     component: 'AppointmentDetail' },
];
